#!/usr/bin/env python3
"""Compare two small, total deterministic Moore machines by product-state BFS.

Input: specprobe.fsm.v1 JSON tables; no evaluation of supplied code or expressions.
Output: JSON. Exit 0 = search result (including a witness); 3 = resource-limited;
2 = invalid input or I/O failure. This is NOT a prose parser or a Quint/TLA+ engine.
"""
from __future__ import annotations

import argparse
from collections import deque
from dataclasses import dataclass
import hashlib
import json
from pathlib import Path
import sys
from typing import Any

MAX_FILE_BYTES = 2 * 1024 * 1024
MAX_STATES = 10_000
MAX_EVENTS = 256


class InputError(ValueError):
    """The explicit finite model does not satisfy the helper's input contract."""


def _object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise InputError(f"Duplicate JSON key: {key!r}")
        result[key] = value
    return result


def _bad_constant(value: str) -> None:
    raise InputError(f"Non-JSON numeric constant: {value}")


def _names(value: Any, field: str) -> list[str]:
    if not isinstance(value, list) or not value:
        raise InputError(f"{field} must be a nonempty array")
    if any(not isinstance(item, str) or not item.strip() for item in value):
        raise InputError(f"{field} must contain nonempty strings")
    if len(set(value)) != len(value):
        raise InputError(f"{field} contains duplicate names")
    return value


def canonical(value: Any) -> str:
    try:
        return json.dumps(value, sort_keys=True, ensure_ascii=False,
                          separators=(",", ":"), allow_nan=False)
    except (TypeError, ValueError, RecursionError) as exc:
        raise InputError("Observation must be finite JSON data") from exc


@dataclass(frozen=True)
class Model:
    name: str
    events: tuple[str, ...]
    observation_fields: tuple[str, ...]
    initial: str
    states: dict[str, Any]
    digest: str
    origin: str

    def observation_key(self, state: str) -> str:
        # Canonical JSON deliberately distinguishes Boolean true from numeric 1.
        return canonical(self.states[state]["observation"])

    def successor(self, state: str, event: str) -> str:
        return self.states[state]["on"][event]


def validate(data: Any, *, digest: str = "in-memory", origin: str = "in-memory") -> Model:
    if not isinstance(data, dict):
        raise InputError("Model must be a JSON object")
    allowed = {"format", "name", "events", "observation_fields", "initial", "states", "metadata"}
    if set(data) - allowed:
        raise InputError(f"Unknown model fields: {sorted(set(data) - allowed)}")
    if data.get("format") != "specprobe.fsm.v1":
        raise InputError("format must be specprobe.fsm.v1")
    name = data.get("name")
    if not isinstance(name, str) or not name.strip():
        raise InputError("name must be a nonempty string")
    events = _names(data.get("events"), "events")
    obs_fields = _names(data.get("observation_fields"), "observation_fields")
    if len(events) > MAX_EVENTS:
        raise InputError(f"Too many events: limit is {MAX_EVENTS}")
    states = data.get("states")
    if not isinstance(states, dict) or not states or len(states) > MAX_STATES:
        raise InputError(f"states must be a nonempty object with at most {MAX_STATES} entries")
    if any(not isinstance(state, str) or not state.strip() for state in states):
        raise InputError("State IDs must be nonempty strings")
    initial = data.get("initial")
    if not isinstance(initial, str) or initial not in states:
        raise InputError("initial must name a declared state")
    for state, body in states.items():
        if not isinstance(body, dict) or set(body) != {"observation", "on"}:
            raise InputError(f"{state}: expected exactly observation and on")
        obs = body["observation"]
        if not isinstance(obs, dict) or set(obs) != set(obs_fields):
            raise InputError(f"{state}: observation fields must exactly match observation_fields")
        canonical(obs)
        transitions = body["on"]
        if not isinstance(transitions, dict) or set(transitions) != set(events):
            raise InputError(f"{state}: declare exactly one transition for EVERY event; no implicit defaults")
        for event, target in transitions.items():
            if not isinstance(target, str) or target not in states:
                raise InputError(f"{state}/{event}: target must be one declared state")
    return Model(name, tuple(events), tuple(obs_fields), initial, states, digest, origin)


def load_model(path: Path) -> Model:
    with path.open("rb") as stream:
        raw = stream.read(MAX_FILE_BYTES + 1)
    if len(raw) > MAX_FILE_BYTES:
        raise InputError(f"Model exceeds {MAX_FILE_BYTES} bytes")
    try:
        data = json.loads(raw.decode("utf-8"), object_pairs_hook=_object,
                          parse_constant=_bad_constant)
    except (UnicodeError, json.JSONDecodeError, RecursionError) as exc:
        raise InputError("Invalid UTF-8 JSON model") from exc
    return validate(data, digest=hashlib.sha256(raw).hexdigest(), origin=str(path))


def compare(left: Model, right: Model, max_pairs: int = 100_000) -> dict[str, Any]:
    if isinstance(max_pairs, bool) or not isinstance(max_pairs, int) or max_pairs < 1:
        raise InputError("max_pairs must be a positive integer")
    if set(left.events) != set(right.events):
        raise InputError("Models must declare the same event alphabet")
    if set(left.observation_fields) != set(right.observation_fields):
        raise InputError("Models must declare the same observation interface")

    Pair = tuple[str, str]
    initial = (left.initial, right.initial)
    parents: dict[Pair, tuple[Pair, str] | None] = {initial: None}
    queue: deque[Pair] = deque([initial])
    truncated = False
    examined = 0

    def record(status: str) -> dict[str, Any]:
        return {
            "status": status,
            "method": "explicit_product_breadth_first_search",
            "models": [
                {"name": m.name, "path": m.origin, "sha256": m.digest,
                 "declared_states": len(m.states)} for m in (left, right)
            ],
            "scope": {
                "kind": "two_declared_total_deterministic_finite_moore_machines",
                "events": list(left.events),
                "observation_fields": list(left.observation_fields),
                "includes_initial_observation": True,
                "max_pairs": max_pairs,
                "pairs_discovered": len(parents),
                "pairs_examined": examined,
                "truncated": truncated,
            },
            "source_alignment": "not_evaluated_by_this_script",
            "policy_selection": "not_performed",
        }

    while queue:
        pair = queue.popleft()
        examined += 1
        if left.observation_key(pair[0]) != right.observation_key(pair[1]):
            chain: list[tuple[Pair, str | None]] = []
            current = pair
            while True:
                parent = parents[current]
                chain.append((current, None if parent is None else parent[1]))
                if parent is None:
                    break
                current = parent[0]
            chain.reverse()
            result = record("distinguishing_trace")
            result["witness"] = {
                "events": [event for _, event in chain if event is not None],
                "event_count": len(chain) - 1,
                "shortest_for_declared_models": not truncated,
                "trace": [
                    {"event": event, "left_state": states[0], "right_state": states[1],
                     "left_observation": left.states[states[0]]["observation"],
                     "right_observation": right.states[states[1]]["observation"]}
                    for states, event in chain
                ],
            }
            return result
        for event in left.events:
            target = (left.successor(pair[0], event), right.successor(pair[1], event))
            if target in parents:
                continue
            if len(parents) >= max_pairs:
                truncated = True
                continue
            parents[target] = (pair, event)
            queue.append(target)

    status = "inconclusive" if truncated else "no_observable_difference_in_declared_models"
    result = record(status)
    result["reachable_product_exhausted"] = not truncated
    return result


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("left", type=Path)
    parser.add_argument("right", type=Path)
    parser.add_argument("--max-pairs", type=int, default=100_000)
    args = parser.parse_args(argv)
    try:
        result = compare(load_model(args.left), load_model(args.right), args.max_pairs)
    except (InputError, OSError, RecursionError) as exc:
        print(json.dumps({"status": "input_error", "message": str(exc)}, ensure_ascii=False),
              file=sys.stderr)
        return 2
    print(json.dumps(result, ensure_ascii=False, indent=2, allow_nan=False))
    return 3 if result["status"] == "inconclusive" else 0


if __name__ == "__main__":
    raise SystemExit(main())

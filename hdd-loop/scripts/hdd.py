#!/usr/bin/env python3
"""hdd-loop orchestration helper.

This runner is intentionally small. The Agent Skill remains the method; this file only
manages prompts, transports, iteration files, and continuity ledger state.

Python 3.10+, standard library only.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import shlex
import shutil
import subprocess
import sys
import textwrap
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

PACKAGE_ROOT = Path(__file__).resolve().parent.parent
DIEGETIC_POLICY = PACKAGE_ROOT / "references" / "DIEGETIC_DREAMER.md"
DREAMER_POLICY = PACKAGE_ROOT / "references" / "DREAMER.md"
REDPEN_POLICY = PACKAGE_ROOT / "references" / "RED_PEN.md"
DEFAULT_HDD_ROOT = Path(".hdd")
TRIAL_NAME_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*$")

LEDGER_KEYS = (
    "preserve",
    "established",
    "rejected",
    "constraints",
    "open_questions",
    "human_pressure",
    "harvest_candidates",
)

PATCH_MAP = {
    "preserve_add": "preserve",
    "established_add": "established",
    "rejected_add": "rejected",
    "constraints_add": "constraints",
    "open_questions_add": "open_questions",
    "harvest_candidates_add": "harvest_candidates",
}


class HDDException(RuntimeError):
    pass


def now_iso() -> str:
    return dt.datetime.now(dt.timezone.utc).astimezone().isoformat(timespec="seconds")


def validate_trial_name(name: str) -> str:
    if name == "current" or not TRIAL_NAME_RE.fullmatch(name):
        raise HDDException(
            "Trial names must be one directory name containing only letters, numbers, "
            "periods, underscores, or hyphens, and cannot be 'current'."
        )
    return name


def next_trial_name(root: Path) -> str:
    base = dt.datetime.now().astimezone().strftime("%Y%m%d-%H%M%S")
    candidate = base
    suffix = 2
    while (root / candidate).exists() or (root / candidate).is_symlink():
        candidate = f"{base}-{suffix:02d}"
        suffix += 1
    return candidate


def current_workspace(root: Path) -> Path:
    current = root / "current"
    if not current.is_symlink():
        legacy_hint = (
            " Use `--workspace .hdd` for a legacy single-workspace layout."
            if (root / "ledger.json").exists()
            else ""
        )
        raise HDDException(
            f"No current HDD trial found under {root}. Run `hdd.py init ...` first "
            "or select one with --trial."
            + legacy_hint
        )
    target = Path(os.readlink(current))
    if target.is_absolute() or len(target.parts) != 1:
        raise HDDException(
            f"Invalid current pointer at {current}; it must name one direct child of {root}."
        )
    validate_trial_name(target.name)
    workspace = root / target.name
    if workspace.is_symlink():
        raise HDDException(f"HDD trial directories cannot be symlinks: {workspace}")
    return workspace


def set_current(root: Path, workspace: Path) -> None:
    root.mkdir(parents=True, exist_ok=True)
    current = root / "current"
    if (current.exists() or current.is_symlink()) and not current.is_symlink():
        raise HDDException(f"Cannot replace non-symlink current path: {current}")
    temporary = root / f".current-{os.getpid()}.tmp"
    try:
        if temporary.exists() or temporary.is_symlink():
            temporary.unlink()
        temporary.symlink_to(workspace.name, target_is_directory=True)
        temporary.replace(current)
    except OSError as exc:
        raise HDDException(f"Could not update current trial pointer at {current}: {exc}") from exc
    finally:
        if temporary.exists() or temporary.is_symlink():
            temporary.unlink()


def resolve_workspace(args: argparse.Namespace) -> tuple[Path, Path | None]:
    trial = getattr(args, "trial", None)
    if args.workspace is not None:
        if trial:
            raise HDDException("Use either --workspace or --trial, not both.")
        return args.workspace, None
    root = args.root
    if args.command == "init":
        trial_name = validate_trial_name(trial) if trial else next_trial_name(root)
        workspace = root / trial_name
        if workspace.is_symlink():
            raise HDDException(f"HDD trial directories cannot be symlinks: {workspace}")
        return workspace, root
    if trial:
        workspace = root / validate_trial_name(trial)
        if workspace.is_symlink():
            raise HDDException(f"HDD trial directories cannot be symlinks: {workspace}")
        return workspace, None
    return current_workspace(root), None


def read_text(path: Path, default: str = "") -> str:
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError:
        return default


def atomic_write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(content, encoding="utf-8")
    tmp.replace(path)


def atomic_json(path: Path, value: Any) -> None:
    atomic_write(path, json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def unique_append(items: list[str], additions: list[str]) -> None:
    seen = {x.strip() for x in items if isinstance(x, str)}
    for item in additions:
        if not isinstance(item, str):
            continue
        normalized = item.strip()
        if normalized and normalized not in seen:
            items.append(normalized)
            seen.add(normalized)


def default_ledger() -> dict[str, Any]:
    value: dict[str, Any] = {"iteration": 0}
    for key in LEDGER_KEYS:
        value[key] = []
    value["history"] = []
    value["last_pressure"] = []
    value["pending"] = None
    return value


def load_ledger(workspace: Path) -> dict[str, Any]:
    path = workspace / "ledger.json"
    if not path.exists():
        return default_ledger()
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise HDDException(f"Invalid ledger JSON: {path}: {exc}") from exc
    base = default_ledger()
    base.update(value)
    for key in LEDGER_KEYS:
        if not isinstance(base.get(key), list):
            raise HDDException(f"ledger field {key!r} must be an array")
    if not isinstance(base.get("history"), list):
        base["history"] = []
    return base


def render_ledger(ledger: dict[str, Any]) -> str:
    titles = {
        "preserve": "Preserve",
        "established": "Established",
        "rejected": "Rejected",
        "constraints": "Constraints",
        "open_questions": "Open Questions",
        "human_pressure": "Human Pressure",
        "harvest_candidates": "Harvest Candidates",
    }
    lines = ["# HDD Ledger", "", f"Iteration: {ledger.get('iteration', 0)}", ""]
    for key in LEDGER_KEYS:
        lines += [f"## {titles[key]}", ""]
        values = ledger.get(key) or []
        if values:
            lines.extend(f"- {x}" for x in values)
        else:
            lines.append("- (none)")
        lines.append("")
    pressure = ledger.get("last_pressure") or []
    lines += ["## Latest Red Pen Pressure", ""]
    if pressure:
        lines.extend(f"- {x}" for x in pressure)
    else:
        lines.append("- (none)")
    lines.append("")
    pending = ledger.get("pending")
    lines += ["## Pending", "", f"{json.dumps(pending, ensure_ascii=False) if pending else '(none)'}", ""]
    return "\n".join(lines)


def save_ledger(workspace: Path, ledger: dict[str, Any]) -> None:
    atomic_json(workspace / "ledger.json", ledger)
    atomic_write(workspace / "ledger.md", render_ledger(ledger))


def ensure_workspace(workspace: Path) -> None:
    if not workspace.exists() or not (workspace / "ledger.json").exists():
        raise HDDException(
            f"No HDD workspace found at {workspace}. Run `hdd.py init ...` first."
        )
    (workspace / "iterations").mkdir(parents=True, exist_ok=True)
    (workspace / "outbox").mkdir(parents=True, exist_ok=True)


def next_iteration(ledger: dict[str, Any]) -> int:
    pending = ledger.get("pending")
    if isinstance(pending, dict) and pending.get("iteration"):
        return int(pending["iteration"])
    return int(ledger.get("iteration", 0)) + 1


def iteration_prefix(n: int) -> str:
    return f"{n:04d}"


META_LEAK_RE = re.compile(
    r"\b(?:HDD|Hallucination-Driven|Dreamer|Dreaming|Red Pen|HDD Ledger|"
    r"harvest candidates?|pressure response|dream iteration|artifact state update|"
    r"next stress targets|stop conditions?|grounding gate|iteration\s*\d*)\b",
    re.IGNORECASE,
)


def sanitize_inworld_text(text: str) -> str:
    """Remove obvious orchestration/editorial framing from material shown to the Dreamer.

    Raw text is never modified on disk; this is only the diegetic view compiled into the
    next Dreamer prompt. The compiler is deliberately conservative: it drops lines that
    explicitly reveal HDD orchestration instead of trying to rewrite their meaning.
    """
    out: list[str] = []
    skipped = False
    for line in text.splitlines():
        if META_LEAK_RE.search(line):
            skipped = True
            continue
        out.append(line)
    cleaned = "\n".join(out).strip()
    if skipped and cleaned:
        cleaned += "\n\n[Some editorial framing from the previous field report was omitted.]"
    return cleaned


def inworld_entries(values: Any) -> list[str]:
    result: list[str] = []
    if not isinstance(values, list):
        return result
    for value in values:
        if not isinstance(value, str):
            continue
        item = value.strip()
        if not item or META_LEAK_RE.search(item):
            continue
        result.append(item)
    return result


def render_inworld_list(title: str, values: list[str]) -> str:
    if not values:
        return ""
    return "\n".join([f"## {title}", "", *(f"- {x}" for x in values), ""])


def compile_world_state(workspace: Path, ledger: dict[str, Any]) -> str:
    """Compile meta-aware HDD state into diegetic facts for the Dreamer.

    Open questions and harvest candidates are intentionally withheld. They are critic/host
    concerns and bias the Dreamer toward designing for the methodology instead of inhabiting
    the artifact.
    """
    seed = sanitize_inworld_text(read_text(workspace / "seed.md"))
    artifact = sanitize_inworld_text(read_text(workspace / "artifact.md"))

    observed: list[str] = []
    unique_append(observed, inworld_entries(ledger.get("preserve")))
    unique_append(observed, inworld_entries(ledger.get("established")))

    corrections: list[str] = []
    unique_append(corrections, inworld_entries(ledger.get("rejected")))
    unique_append(corrections, inworld_entries(ledger.get("constraints")))

    new_information = inworld_entries(ledger.get("last_pressure"))
    operator_request = inworld_entries(ledger.get("human_pressure"))

    parts = [
        "# Current situation",
        "",
        seed or "You are already inside the current environment. Continue from what is present.",
        "",
    ]
    if artifact:
        parts += ["# Previous field report", "", artifact, ""]
    for section in (
        render_inworld_list("Behavior already demonstrated", observed),
        render_inworld_list("Newly confirmed limits and corrections", corrections),
        render_inworld_list("Current operator request", operator_request),
        render_inworld_list("New information since the previous report", new_information),
    ):
        if section:
            parts += [section, ""]
    return "\n".join(parts).strip() + "\n"


def compose_dreamer_prompt(workspace: Path, ledger: dict[str, Any]) -> str:
    policy = read_text(DIEGETIC_POLICY)
    world = compile_world_state(workspace, ledger)
    return textwrap.dedent(
        f"""
        {policy}

        ---

        {world}

        # What to do now

        Continue operating the same tool or environment from its current state.
        Treat the limits and corrections above as facts that have just become known inside
        the world, not as review comments. Investigate their consequences through concrete
        use. Prefer commands, observations, failures, retries, and changed behavior over a
        design essay.
        """
    ).strip() + "\n"


def compose_critic_prompt(workspace: Path, ledger: dict[str, Any], dream: str) -> str:
    policy = read_text(REDPEN_POLICY)
    seed = read_text(workspace / "seed.md")
    return textwrap.dedent(
        f"""
        {policy}

        ---

        # Seed

        {seed}

        # Ledger Before This Iteration

        {render_ledger(ledger)}

        # Dreamer Output To Review

        {dream}

        # Required response

        Return only the structured JSON object described in the external-critic contract.
        Do not wrap it in a Markdown code fence.
        """
    ).strip() + "\n"


def compose_harvest_prompt(workspace: Path, ledger: dict[str, Any]) -> str:
    return textwrap.dedent(
        f"""
        You are grounding an HDD exploration after Dreaming has produced useful affordances.

        Do not continue fictional lore. Extract what can be stolen back into reality.

        # Seed

        {read_text(workspace / 'seed.md')}

        # Current Artifact

        {read_text(workspace / 'artifact.md')}

        # Ledger

        {render_ledger(ledger)}

        Produce a grounded harvest with exactly these sections:

        # Core Affordance
        # Surviving Abstractions
        # Removed Magic
        # Reality Mapping
        # Research Boundary
        # Smallest Useful Artifact
        # Why Existing Tools Are Not Enough

        Separate directly observable mechanisms from inferred semantics and user-declared semantics.
        """
    ).strip() + "\n"


def infer_transport(prefix: str) -> str:
    explicit = os.getenv(f"{prefix}_TRANSPORT")
    if explicit:
        return explicit.strip().lower()
    if os.getenv(f"{prefix}_CMD"):
        return "command"
    if prefix == "HDD_DREAMER" and os.getenv("OPENROUTER_API_KEY"):
        return "openrouter"
    return "manual"


def endpoint_for(base: str) -> str:
    base = base.rstrip("/")
    if base.endswith("/chat/completions"):
        return base
    return base + "/chat/completions"


def extract_message_content(payload: dict[str, Any]) -> str:
    try:
        message = payload["choices"][0]["message"]
    except (KeyError, IndexError, TypeError) as exc:
        raise HDDException(f"Unexpected model response shape: {payload!r}") from exc
    content = message.get("content")
    if isinstance(content, str) and content.strip():
        return content
    if isinstance(content, list):
        chunks: list[str] = []
        for item in content:
            if isinstance(item, dict) and isinstance(item.get("text"), str):
                chunks.append(item["text"])
        if chunks:
            return "\n".join(chunks)
    reasoning = message.get("reasoning") or message.get("reasoning_content")
    if isinstance(reasoning, str) and reasoning.strip():
        return reasoning
    raise HDDException("Model response contained no usable text content")


def http_model_call(prefix: str, prompt: str, transport: str) -> str:
    if transport == "openrouter":
        base = os.getenv(f"{prefix}_BASE_URL", "https://openrouter.ai/api/v1")
        key = os.getenv(f"{prefix}_API_KEY") or os.getenv("OPENROUTER_API_KEY")
        default_model = "deepseek/deepseek-r1" if prefix == "HDD_DREAMER" else ""
    else:
        base = os.getenv(f"{prefix}_BASE_URL", "")
        key = os.getenv(f"{prefix}_API_KEY", "")
        default_model = ""
    model = os.getenv(f"{prefix}_MODEL", default_model).strip()
    if not base:
        raise HDDException(f"{prefix}_BASE_URL is required for {transport}")
    if not model:
        raise HDDException(f"{prefix}_MODEL is required for {transport}")
    if transport == "openrouter" and not key:
        raise HDDException("OPENROUTER_API_KEY (or role-specific API key) is required")

    body: dict[str, Any] = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
    }
    max_tokens = os.getenv(f"{prefix}_MAX_TOKENS")
    if max_tokens:
        body["max_tokens"] = int(max_tokens)
    elif prefix == "HDD_DREAMER":
        body["max_tokens"] = 16384
    temperature = os.getenv(f"{prefix}_TEMPERATURE")
    if temperature:
        body["temperature"] = float(temperature)

    headers = {"Content-Type": "application/json"}
    if key:
        headers["Authorization"] = f"Bearer {key}"
    if transport == "openrouter":
        referer = os.getenv("HDD_HTTP_REFERER")
        title = os.getenv("HDD_APP_TITLE", "hdd-loop")
        if referer:
            headers["HTTP-Referer"] = referer
        if title:
            headers["X-Title"] = title

    request = urllib.request.Request(
        endpoint_for(base),
        data=json.dumps(body).encode("utf-8"),
        headers=headers,
        method="POST",
    )
    timeout = float(os.getenv(f"{prefix}_HTTP_TIMEOUT", "300"))
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            raw = response.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise HDDException(f"HTTP {exc.code} from model endpoint: {detail[:2000]}") from exc
    except urllib.error.URLError as exc:
        raise HDDException(f"Model endpoint request failed: {exc}") from exc
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise HDDException(f"Model endpoint returned non-JSON response: {raw[:2000]}") from exc
    return extract_message_content(payload)


def command_model_call(prefix: str, prompt: str) -> str:
    command = os.getenv(f"{prefix}_CMD", "").strip()
    if not command:
        raise HDDException(f"{prefix}_CMD is required for command transport")
    argv = shlex.split(command)
    if not argv:
        raise HDDException(f"{prefix}_CMD is empty after parsing")
    env = os.environ.copy()
    model = os.getenv(f"{prefix}_MODEL")
    if model:
        env["HDD_MODEL"] = model
    try:
        proc = subprocess.run(
            argv,
            input=prompt,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env=env,
            timeout=float(os.getenv(f"{prefix}_CMD_TIMEOUT", "600")),
            check=False,
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        raise HDDException(f"Command transport failed: {exc}") from exc
    if proc.returncode != 0:
        raise HDDException(
            f"Command transport exited {proc.returncode}: {proc.stderr[-4000:]}"
        )
    if not proc.stdout.strip():
        raise HDDException("Command transport returned empty stdout")
    return proc.stdout


def call_model(prefix: str, prompt: str) -> tuple[str, str | None]:
    transport = infer_transport(prefix)
    if transport == "manual":
        return transport, None
    if transport == "command":
        return transport, command_model_call(prefix, prompt)
    if transport in {"openrouter", "openai-compatible"}:
        return transport, http_model_call(prefix, prompt, transport)
    raise HDDException(
        f"Unsupported transport {transport!r}; expected manual, command, openrouter, or openai-compatible"
    )


def extract_json_object(text: str) -> dict[str, Any]:
    candidate = text.strip()
    fenced = re.match(r"^```(?:json)?\s*(.*?)\s*```$", candidate, re.S | re.I)
    if fenced:
        candidate = fenced.group(1).strip()
    try:
        value = json.loads(candidate)
    except json.JSONDecodeError:
        start = candidate.find("{")
        end = candidate.rfind("}")
        if start < 0 or end <= start:
            raise HDDException("Could not find JSON object in critic response")
        try:
            value = json.loads(candidate[start : end + 1])
        except json.JSONDecodeError as exc:
            raise HDDException(f"Invalid critic JSON: {exc}") from exc
    if not isinstance(value, dict):
        raise HDDException("Critic response must be a JSON object")
    return value


def validate_patch(patch: dict[str, Any]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    result["summary"] = str(patch.get("summary", "")).strip()
    for external in PATCH_MAP:
        values = patch.get(external, [])
        if values is None:
            values = []
        if not isinstance(values, list):
            raise HDDException(f"Critic field {external} must be an array")
        result[external] = [str(x).strip() for x in values if str(x).strip()]
    pressure = patch.get("pressure", [])
    if not isinstance(pressure, list):
        raise HDDException("Critic field pressure must be an array")
    result["pressure"] = [str(x).strip() for x in pressure if str(x).strip()][:3]
    result["redpen_markdown"] = str(patch.get("redpen_markdown", "")).strip()
    return result


def default_redpen_markdown(patch: dict[str, Any]) -> str:
    lines = ["# Red Pen", ""]
    if patch.get("summary"):
        lines += [patch["summary"], ""]
    for title, field in (
        ("Preserve", "preserve_add"),
        ("Established", "established_add"),
        ("Rejected", "rejected_add"),
        ("Constraints", "constraints_add"),
        ("Open Questions", "open_questions_add"),
        ("Harvest Candidates", "harvest_candidates_add"),
        ("Pressure", "pressure"),
    ):
        lines += [f"## {title}", ""]
        values = patch.get(field) or []
        lines.extend(f"- {x}" for x in values) if values else lines.append("- (none)")
        lines.append("")
    return "\n".join(lines)


def apply_patch(workspace: Path, ledger: dict[str, Any], patch: dict[str, Any], iteration: int) -> None:
    patch = validate_patch(patch)
    for external, internal in PATCH_MAP.items():
        unique_append(ledger[internal], patch[external])
    ledger["last_pressure"] = list(patch["pressure"])
    ledger["iteration"] = max(int(ledger.get("iteration", 0)), iteration)
    ledger["pending"] = None
    ledger["history"].append(
        {
            "iteration": iteration,
            "at": now_iso(),
            "summary": patch["summary"],
            "pressure": patch["pressure"],
        }
    )
    redpen_md = patch["redpen_markdown"] or default_redpen_markdown(patch)
    atomic_write(workspace / "redpen.md", redpen_md + ("\n" if not redpen_md.endswith("\n") else ""))
    prefix = iteration_prefix(iteration)
    atomic_json(workspace / "iterations" / f"{prefix}-redpen.json", patch)
    atomic_write(workspace / "iterations" / f"{prefix}-redpen.md", redpen_md + "\n")
    save_ledger(workspace, ledger)
    append_transcript(workspace, "redpen", iteration, patch)


def append_transcript(workspace: Path, kind: str, iteration: int, payload: Any) -> None:
    record = {"at": now_iso(), "kind": kind, "iteration": iteration, "payload": payload}
    path = workspace / "transcript.jsonl"
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(record, ensure_ascii=False) + "\n")


def save_dream(workspace: Path, ledger: dict[str, Any], dream: str, iteration: int, transport: str) -> None:
    prefix = iteration_prefix(iteration)
    atomic_write(workspace / "iterations" / f"{prefix}-dreamer.md", dream.rstrip() + "\n")
    atomic_write(workspace / "artifact.md", dream.rstrip() + "\n")
    critic_prompt = compose_critic_prompt(workspace, ledger, dream)
    atomic_write(workspace / "outbox" / f"{prefix}-critic-prompt.md", critic_prompt)
    ledger["pending"] = {"iteration": iteration, "stage": "redpen", "dreamer_transport": transport}
    save_ledger(workspace, ledger)
    append_transcript(workspace, "dreamer", iteration, {"transport": transport, "text": dream})


def cmd_init(args: argparse.Namespace) -> None:
    workspace = args.workspace
    if args.seed_file:
        seed = Path(args.seed_file).read_text(encoding="utf-8")
    elif args.seed:
        seed = args.seed
    else:
        raise HDDException("init requires --seed or --seed-file")
    artifact = ""
    if args.artifact_file:
        artifact = Path(args.artifact_file).read_text(encoding="utf-8")
    if workspace.exists():
        if not workspace.is_dir():
            raise HDDException(f"Trial workspace is not a directory: {workspace}")
        if any(workspace.iterdir()):
            if not args.force:
                raise HDDException(
                    f"Trial workspace {workspace} is not empty. "
                    "Use --force to overwrite that trial."
                )
            shutil.rmtree(workspace)
    workspace.mkdir(parents=True, exist_ok=True)
    (workspace / "iterations").mkdir(exist_ok=True)
    (workspace / "outbox").mkdir(exist_ok=True)
    atomic_write(workspace / "seed.md", seed.rstrip() + "\n")
    atomic_write(workspace / "artifact.md", artifact.rstrip() + ("\n" if artifact else ""))
    atomic_write(workspace / "redpen.md", "")
    ledger = default_ledger()
    if args.human:
        unique_append(ledger["human_pressure"], [args.human])
    save_ledger(workspace, ledger)
    atomic_write(workspace / "human-pressure.md", (args.human or "").rstrip() + ("\n" if args.human else ""))
    if args.current_root is not None:
        set_current(args.current_root, workspace)
    print(f"Initialized HDD trial: {workspace}")
    if args.current_root is not None:
        print(f"Current trial: {args.current_root / 'current'} -> {workspace.name}")


def cmd_status(args: argparse.Namespace) -> None:
    ensure_workspace(args.workspace)
    ledger = load_ledger(args.workspace)
    print(render_ledger(ledger))
    print(f"Dreamer transport: {infer_transport('HDD_DREAMER')}")
    print(f"Critic transport:  {infer_transport('HDD_CRITIC')}")


def cmd_human(args: argparse.Namespace) -> None:
    ensure_workspace(args.workspace)
    ledger = load_ledger(args.workspace)
    unique_append(ledger["human_pressure"], [args.note])
    path = args.workspace / "human-pressure.md"
    existing = read_text(path)
    atomic_write(path, existing + f"- {args.note.strip()}\n")
    save_ledger(args.workspace, ledger)
    append_transcript(args.workspace, "human-pressure", int(ledger.get("iteration", 0)), args.note)
    print("Human pressure recorded.")


def cmd_dream(args: argparse.Namespace) -> None:
    ensure_workspace(args.workspace)
    ledger = load_ledger(args.workspace)
    if ledger.get("pending") and ledger["pending"].get("stage") == "redpen" and not args.force:
        raise HDDException("A Dreamer response is already pending Red Pen. Resolve it or use --force.")
    iteration = next_iteration(ledger)
    world = compile_world_state(args.workspace, ledger)
    prompt = compose_dreamer_prompt(args.workspace, ledger)
    prefix = iteration_prefix(iteration)
    atomic_write(args.workspace / "iterations" / f"{prefix}-world.md", world)
    atomic_write(args.workspace / "outbox" / f"{prefix}-dreamer-prompt.md", prompt)
    append_transcript(args.workspace, "dreamer-prompt", iteration, {"mode": "diegetic", "text": prompt})
    transport, result = call_model("HDD_DREAMER", prompt)
    if result is None:
        ledger["pending"] = {"iteration": iteration, "stage": "dreamer-manual", "dreamer_transport": "manual"}
        save_ledger(args.workspace, ledger)
        print(args.workspace / "outbox" / f"{prefix}-dreamer-prompt.md")
        return
    save_dream(args.workspace, ledger, result, iteration, transport)
    print(args.workspace / "iterations" / f"{prefix}-dreamer.md")



def cmd_preview_dream(args: argparse.Namespace) -> None:
    ensure_workspace(args.workspace)
    ledger = load_ledger(args.workspace)
    prompt = compose_dreamer_prompt(args.workspace, ledger)
    if args.check_meta:
        leaks = [
            token for token in ("HDD", "Dreamer", "Dreaming", "Red Pen", "Harvest Candidate", "Harvest Candidates", "Grounding Gate")
            if re.search(rf"\b{re.escape(token)}\b", prompt, re.IGNORECASE)
        ]
        if leaks:
            raise HDDException(f"Diegetic prompt leaks orchestration terms: {', '.join(leaks)}")
    print(prompt, end="")

def cmd_ingest_dreamer(args: argparse.Namespace) -> None:
    ensure_workspace(args.workspace)
    ledger = load_ledger(args.workspace)
    pending = ledger.get("pending")
    if not isinstance(pending, dict) or pending.get("stage") != "dreamer-manual":
        if not args.force:
            raise HDDException("No manual Dreamer response is pending. Use --force to ingest anyway.")
        iteration = next_iteration(ledger)
    else:
        iteration = int(pending["iteration"])
    dream = Path(args.file).read_text(encoding="utf-8")
    save_dream(args.workspace, ledger, dream, iteration, "manual")
    print(args.workspace / "iterations" / f"{iteration_prefix(iteration)}-dreamer.md")


def cmd_critic(args: argparse.Namespace) -> None:
    ensure_workspace(args.workspace)
    ledger = load_ledger(args.workspace)
    pending = ledger.get("pending")
    if not isinstance(pending, dict) or pending.get("stage") != "redpen":
        raise HDDException("No Dreamer response is pending Red Pen.")
    iteration = int(pending["iteration"])
    dream_path = args.workspace / "iterations" / f"{iteration_prefix(iteration)}-dreamer.md"
    dream = read_text(dream_path)
    prompt = compose_critic_prompt(args.workspace, ledger, dream)
    atomic_write(args.workspace / "outbox" / f"{iteration_prefix(iteration)}-critic-prompt.md", prompt)
    transport, result = call_model("HDD_CRITIC", prompt)
    if result is None:
        print(args.workspace / "outbox" / f"{iteration_prefix(iteration)}-critic-prompt.md")
        return
    patch = extract_json_object(result)
    apply_patch(args.workspace, ledger, patch, iteration)
    print(args.workspace / "iterations" / f"{iteration_prefix(iteration)}-redpen.md")


def cmd_record_redpen(args: argparse.Namespace) -> None:
    ensure_workspace(args.workspace)
    ledger = load_ledger(args.workspace)
    pending = ledger.get("pending")
    if isinstance(pending, dict) and pending.get("stage") == "redpen":
        iteration = int(pending["iteration"])
    elif args.iteration is not None:
        iteration = args.iteration
    else:
        raise HDDException("No Red Pen is pending; provide --iteration explicitly if intentional.")
    patch = extract_json_object(Path(args.file).read_text(encoding="utf-8"))
    apply_patch(args.workspace, ledger, patch, iteration)
    print("Red Pen recorded and ledger updated.")


def cmd_step(args: argparse.Namespace) -> None:
    ensure_workspace(args.workspace)
    ledger = load_ledger(args.workspace)
    pending = ledger.get("pending")
    if isinstance(pending, dict):
        stage = pending.get("stage")
        if stage == "dreamer-manual":
            raise HDDException("Manual Dreamer response pending; use ingest-dreamer first.")
        if stage == "redpen":
            if args.external_critic:
                cmd_critic(args)
                return
            raise HDDException("Red Pen pending. Host agent should review or use --external-critic.")
    cmd_dream(args)
    ledger = load_ledger(args.workspace)
    pending = ledger.get("pending")
    if args.external_critic and isinstance(pending, dict) and pending.get("stage") == "redpen":
        cmd_critic(args)


def cmd_run(args: argparse.Namespace) -> None:
    if not args.external_critic:
        raise HDDException("run requires --external-critic; otherwise use one host-reviewed step at a time.")
    for _ in range(args.iterations):
        cmd_step(args)
        ledger = load_ledger(args.workspace)
        if ledger.get("pending"):
            raise HDDException(f"Loop stopped with pending state: {ledger['pending']}")


def cmd_harvest_prompt(args: argparse.Namespace) -> None:
    ensure_workspace(args.workspace)
    ledger = load_ledger(args.workspace)
    prompt = compose_harvest_prompt(args.workspace, ledger)
    path = args.workspace / "outbox" / "harvest-prompt.md"
    atomic_write(path, prompt)
    print(path)


def masked_presence(name: str) -> str:
    value = os.getenv(name)
    if not value:
        return "unset"
    return f"set ({len(value)} chars)"


def cmd_doctor(args: argparse.Namespace) -> None:
    print(f"Package root: {PACKAGE_ROOT}")
    print(f"Python: {sys.version.split()[0]}")
    print(f"Dreamer transport: {infer_transport('HDD_DREAMER')}")
    print(f"Dreamer model: {os.getenv('HDD_DREAMER_MODEL', 'deepseek/deepseek-r1 (OpenRouter default)')}")
    print(f"OPENROUTER_API_KEY: {masked_presence('OPENROUTER_API_KEY')}")
    print(f"HDD_DREAMER_API_KEY: {masked_presence('HDD_DREAMER_API_KEY')}")
    print(f"Critic transport: {infer_transport('HDD_CRITIC')}")
    print("Dreamer prompting: diegetic (HDD/Red Pen/Ledger hidden)")
    print(f"HDD_CRITIC_API_KEY: {masked_presence('HDD_CRITIC_API_KEY')}")
    for required in (DIEGETIC_POLICY, DREAMER_POLICY, REDPEN_POLICY):
        print(f"Reference {required.name}: {'ok' if required.exists() else 'MISSING'}")


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Hallucination-Driven Design loop helper")
    p.add_argument("--root", type=Path, default=DEFAULT_HDD_ROOT, help="HDD trial root (default .hdd)")
    p.add_argument(
        "--workspace",
        type=Path,
        help="exact trial workspace; bypasses --root, --trial, and current",
    )
    sub = p.add_subparsers(dest="command", required=True)

    def add_trial_selector(command: argparse.ArgumentParser) -> None:
        command.add_argument("--trial", help="trial directory name under --root")

    q = sub.add_parser("init", help="initialize a new HDD trial")
    add_trial_selector(q)
    q.add_argument("--seed")
    q.add_argument("--seed-file")
    q.add_argument("--artifact-file")
    q.add_argument("--human", help="initial human pressure")
    q.add_argument("--force", action="store_true")
    q.set_defaults(func=cmd_init)

    q = sub.add_parser("status", help="show ledger and transport state")
    add_trial_selector(q)
    q.set_defaults(func=cmd_status)

    q = sub.add_parser("human", help="append human pressure")
    add_trial_selector(q)
    q.add_argument("note")
    q.set_defaults(func=cmd_human)

    q = sub.add_parser("dream", help="invoke or prepare the next Dreamer turn")
    add_trial_selector(q)
    q.add_argument("--force", action="store_true")
    q.set_defaults(func=cmd_dream)

    q = sub.add_parser("preview-dream", help="render the diegetic Dreamer prompt without invoking a model")
    add_trial_selector(q)
    q.add_argument("--check-meta", action="store_true", help="fail if core orchestration terms leak")
    q.set_defaults(func=cmd_preview_dream)

    q = sub.add_parser("ingest-dreamer", help="ingest a manual Dreamer response")
    add_trial_selector(q)
    q.add_argument("--file", required=True)
    q.add_argument("--force", action="store_true")
    q.set_defaults(func=cmd_ingest_dreamer)

    q = sub.add_parser("critic", help="invoke or prepare the Red Pen critic")
    add_trial_selector(q)
    q.set_defaults(func=cmd_critic)

    q = sub.add_parser("record-redpen", help="record a host/manual Red Pen JSON patch")
    add_trial_selector(q)
    q.add_argument("--file", required=True)
    q.add_argument("--iteration", type=int)
    q.set_defaults(func=cmd_record_redpen)

    q = sub.add_parser("step", help="run one HDD iteration")
    add_trial_selector(q)
    q.add_argument("--external-critic", action="store_true")
    q.add_argument("--force", action="store_true")
    q.set_defaults(func=cmd_step)

    q = sub.add_parser("run", help="run multiple fully externalized iterations")
    add_trial_selector(q)
    q.add_argument("--iterations", type=int, default=3)
    q.add_argument("--external-critic", action="store_true", required=True)
    q.add_argument("--force", action="store_true")
    q.set_defaults(func=cmd_run)

    q = sub.add_parser("harvest-prompt", help="write a grounding/harvest prompt")
    add_trial_selector(q)
    q.set_defaults(func=cmd_harvest_prompt)

    q = sub.add_parser("doctor", help="inspect transport/auth resolution without revealing secrets")
    q.set_defaults(func=cmd_doctor)
    return p


def main() -> int:
    p = parser()
    args = p.parse_args()
    try:
        if args.command != "doctor":
            args.workspace, args.current_root = resolve_workspace(args)
        args.func(args)
    except HDDException as exc:
        print(f"hdd-loop: {exc}", file=sys.stderr)
        return 2
    except KeyboardInterrupt:
        print("hdd-loop: interrupted", file=sys.stderr)
        return 130
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

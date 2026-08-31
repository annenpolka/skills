#!/usr/bin/env python3
"""Small smoke/unit test suite for hdd.py."""

from __future__ import annotations

import importlib.util
import json
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("hdd", HERE / "hdd.py")
assert SPEC and SPEC.loader
hdd = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(hdd)


def main() -> int:
    ledger = hdd.default_ledger()
    assert ledger["iteration"] == 0
    hdd.unique_append(ledger["preserve"], ["x", "x", " y "])
    assert ledger["preserve"] == ["x", "y"]

    patch = hdd.validate_patch(
        {
            "summary": "test",
            "preserve_add": ["keep"],
            "pressure": ["p1", "p2", "p3", "p4"],
        }
    )
    assert patch["pressure"] == ["p1", "p2", "p3"]

    parsed = hdd.extract_json_object("```json\n{\"summary\": \"ok\"}\n```")
    assert parsed["summary"] == "ok"

    with tempfile.TemporaryDirectory() as td:
        ws = Path(td) / ".hdd"
        ws.mkdir()
        (ws / "iterations").mkdir()
        (ws / "outbox").mkdir()
        hdd.atomic_write(ws / "seed.md", "seed\n")
        hdd.atomic_write(ws / "artifact.md", "artifact\n")
        hdd.atomic_write(ws / "redpen.md", "")
        hdd.save_ledger(ws, hdd.default_ledger())
        loaded = hdd.load_ledger(ws)
        assert loaded["preserve"] == []
        dream_prompt = hdd.compose_dreamer_prompt(ws, loaded)
        assert "seed" in dream_prompt and "artifact" in dream_prompt
        hdd.save_dream(ws, loaded, "dream result", 1, "test")
        loaded = hdd.load_ledger(ws)
        assert loaded["pending"]["stage"] == "redpen"
        hdd.apply_patch(ws, loaded, {"summary": "ok", "preserve_add": ["affordance"], "pressure": ["constraint"]}, 1)
        final = json.loads((ws / "ledger.json").read_text(encoding="utf-8"))
        assert final["iteration"] == 1
        assert "affordance" in final["preserve"]
        assert final["human_pressure"] == []
        assert final["last_pressure"] == ["constraint"]
        assert final["pending"] is None
    print("OK: hdd.py tests")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

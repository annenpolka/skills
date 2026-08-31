#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from pathlib import Path


def fail(msg: str) -> None:
    raise SystemExit(f"validate_skill.py: {msg}")


def main() -> int:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent)
    skill = root / "SKILL.md"
    if not skill.exists():
        fail("SKILL.md missing")
    text = skill.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        fail("SKILL.md must start with YAML frontmatter")
    parts = text.split("---\n", 2)
    if len(parts) < 3:
        fail("frontmatter closing delimiter missing")
    front = parts[1]
    for key in ("name", "description"):
        if not re.search(rf"(?m)^{re.escape(key)}:\s*.+$", front):
            fail(f"frontmatter field {key!r} missing")
    if not re.search(r"(?m)^name:\s*hdd-loop\s*$", front):
        fail("name must be hdd-loop")
    required = [
        "scripts/hdd.py",
        "scripts/test_hdd.py",
        "agents/openai.yaml",
        "assets/icon.svg",
        "references/DREAMER.md",
        "references/DIEGETIC_DREAMER.md",
        "references/RED_PEN.md",
        "references/METHOD.md",
        "references/AUTH.md",
        "references/CASEBOOK.md",
        "references/raw/README.md",
    ]
    missing = [rel for rel in required if not (root / rel).exists()]
    linked = re.findall(r"\]\((references/[^)]+|scripts/[^)]+|assets/[^)]+)\)", text)
    missing.extend(rel for rel in linked if not (root / rel).exists())
    if missing:
        fail("missing required files: " + ", ".join(sorted(set(missing))))
    if len(text.splitlines()) > 500:
        fail("SKILL.md is over 500 lines; move detail into references/")
    print("validate_skill.py: OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

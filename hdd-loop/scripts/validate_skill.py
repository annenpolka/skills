#!/usr/bin/env python3
"""Lightweight Agent Skills package validator (standard library only)."""

from __future__ import annotations

import re
import sys
from pathlib import Path


def fail(message: str) -> None:
    print(f"ERROR: {message}")
    raise SystemExit(1)


def parse_frontmatter(text: str) -> dict[str, str]:
    if not text.startswith("---\n"):
        fail("SKILL.md must start with YAML frontmatter")
    end = text.find("\n---\n", 4)
    if end < 0:
        fail("SKILL.md frontmatter closing delimiter not found")
    front = text[4:end]
    values: dict[str, str] = {}
    for line in front.splitlines():
        if not line or line.startswith(" ") or line.startswith("\t"):
            continue
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def main() -> int:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    skill = root / "SKILL.md"
    if not skill.exists():
        fail(f"missing {skill}")
    text = skill.read_text(encoding="utf-8")
    fm = parse_frontmatter(text)
    name = fm.get("name", "")
    description = fm.get("description", "")
    if not name:
        fail("frontmatter name is required")
    if root.name != name:
        fail(f"skill name {name!r} must match parent directory {root.name!r}")
    if len(name) > 64 or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", name):
        fail("name must be <=64 chars, lowercase alphanumeric/hyphen, no edge/consecutive hyphens")
    if not description or len(description) > 1024:
        fail("description must be 1-1024 characters")
    line_count = len(text.splitlines())
    if line_count > 500:
        print(f"WARN: SKILL.md is {line_count} lines; Agent Skills recommends keeping it under 500")
    for directory in ("scripts", "references", "assets"):
        path = root / directory
        if not path.exists():
            print(f"WARN: optional directory missing: {directory}/")
    refs = re.findall(r"\]\((references/[^)]+|scripts/[^)]+|assets/[^)]+)\)", text)
    missing = [ref for ref in refs if not (root / ref).exists()]
    if missing:
        fail("missing referenced files: " + ", ".join(sorted(set(missing))))
    print(f"OK: {name}")
    print(f"SKILL.md lines: {line_count}")
    print(f"references: {sum(1 for _ in (root / 'references').glob('*')) if (root / 'references').exists() else 0}")
    print(f"scripts: {sum(1 for _ in (root / 'scripts').glob('*')) if (root / 'scripts').exists() else 0}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

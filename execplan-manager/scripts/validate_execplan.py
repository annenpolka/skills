#!/usr/bin/env python3
"""
ExecPlan Validation Script

This script validates that an ExecPlan document meets the requirements
specified in the PLANS.md specification.

Usage:
    python validate_execplan.py <path-to-execplan.md>
"""

import sys
import re
from pathlib import Path
from typing import List, Tuple


REQUIRED_SECTIONS = [
    "Purpose / Big Picture",
    "Progress",
    "Surprises & Discoveries",
    "Decision Log",
    "Outcomes & Retrospective",
    "Context and Orientation",
    "Plan of Work",
    "Concrete Steps",
    "Validation and Acceptance",
    "Idempotence and Recovery",
    "Artifacts and Notes",
    "Interfaces and Dependencies",
]


class ValidationError:
    def __init__(self, severity: str, message: str, line_number: int = None):
        self.severity = severity  # "error" or "warning"
        self.message = message
        self.line_number = line_number

    def __str__(self):
        location = f"Line {self.line_number}: " if self.line_number else ""
        return f"[{self.severity.upper()}] {location}{self.message}"


def validate_execplan(file_path: Path) -> Tuple[bool, List[ValidationError]]:
    """
    Validate an ExecPlan document.

    Returns:
        Tuple of (is_valid, list_of_errors)
    """
    errors = []

    if not file_path.exists():
        errors.append(ValidationError("error", f"File not found: {file_path}"))
        return False, errors

    content = file_path.read_text(encoding="utf-8")
    lines = content.split("\n")

    # Check 1: Title exists (first line should be a # heading)
    if not lines or not lines[0].strip().startswith("# "):
        errors.append(ValidationError("error", "ExecPlan must start with a title (# heading)", 1))

    # Check 2: All required sections exist
    section_pattern = re.compile(r"^##\s+(.+)$")
    found_sections = set()

    for i, line in enumerate(lines, 1):
        match = section_pattern.match(line.strip())
        if match:
            section_name = match.group(1).strip()
            found_sections.add(section_name)

    missing_sections = set(REQUIRED_SECTIONS) - found_sections
    if missing_sections:
        for section in sorted(missing_sections):
            errors.append(ValidationError("error", f"Missing required section: {section}"))

    # Check 3: Progress section has checkboxes
    progress_section = extract_section(content, "Progress")
    if progress_section:
        if not re.search(r"- \[(x| )\]", progress_section):
            errors.append(ValidationError("warning", "Progress section should contain checkboxes (- [ ] or - [x])"))

    # Check 4: No nested triple backtick code fences
    if "```" in content:
        # Count occurrences - if content is wrapped in triple backticks, that's 2
        # Any more than that suggests nested fences
        backtick_count = content.count("```")
        if backtick_count > 2:
            errors.append(ValidationError("warning",
                "ExecPlan should use indentation for code examples, not nested triple-backtick fences"))

    # Check 5: Decision Log format
    decision_section = extract_section(content, "Decision Log")
    if decision_section and len(decision_section.strip()) > 0:
        # Check for proper format: "- Decision:", "  Rationale:", "  Date/Author:"
        if decision_section.strip() != "[実装中に記入予定]" and \
           decision_section.strip() != "[実装完了後に記入予定]":
            if "Decision:" not in decision_section:
                errors.append(ValidationError("warning",
                    "Decision Log entries should use format: 'Decision:', 'Rationale:', 'Date/Author:'"))

    # Check 6: Progress items have timestamps (if marked complete)
    if progress_section:
        completed_items = re.findall(r"- \[x\] (.+)", progress_section)
        for item in completed_items:
            # Look for timestamp format (YYYY-MM-DD HH:MM:SSZ) or (YYYY-MM-DD HH:MM:SS)
            if not re.search(r"\(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}Z?\)", item):
                errors.append(ValidationError("warning",
                    f"Completed progress item missing timestamp: '{item[:50]}...'"))

    # Check 7: Validation section has concrete acceptance criteria
    validation_section = extract_section(content, "Validation and Acceptance")
    if validation_section:
        if len(validation_section.strip()) < 50:
            errors.append(ValidationError("warning",
                "Validation and Acceptance section seems too brief - should include concrete steps and expected outputs"))

    # Check 8: Japanese language check (should be in Japanese per PLANS.md)
    # Simple heuristic: check if there are Japanese characters
    has_japanese = bool(re.search(r'[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]', content))
    if not has_japanese:
        errors.append(ValidationError("warning",
            "ExecPlan should be written in Japanese according to PLANS.md specification"))

    # Determine overall validity
    has_errors = any(e.severity == "error" for e in errors)
    is_valid = not has_errors

    return is_valid, errors


def extract_section(content: str, section_name: str) -> str:
    """
    Extract content of a specific section from the ExecPlan.
    """
    # Find the section heading
    section_pattern = re.compile(rf"^##\s+{re.escape(section_name)}\s*$", re.MULTILINE)
    match = section_pattern.search(content)

    if not match:
        return ""

    start = match.end()

    # Find the next section (## heading)
    next_section = re.search(r"\n##\s+", content[start:])
    if next_section:
        end = start + next_section.start()
    else:
        end = len(content)

    return content[start:end].strip()


def main():
    if len(sys.argv) != 2:
        print("Usage: python validate_execplan.py <path-to-execplan.md>")
        sys.exit(1)

    file_path = Path(sys.argv[1])

    print(f"Validating ExecPlan: {file_path}")
    print("-" * 60)

    is_valid, errors = validate_execplan(file_path)

    if errors:
        for error in errors:
            print(error)
        print("-" * 60)

    if is_valid:
        print("✅ ExecPlan is valid!")
        sys.exit(0)
    else:
        print("❌ ExecPlan has errors that must be fixed.")
        sys.exit(1)


if __name__ == "__main__":
    main()

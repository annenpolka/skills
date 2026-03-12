#!/usr/bin/env python3
"""dep_graph.py — Generate a Mermaid dependency diagram from import statements.

Usage: python3 dep_graph.py <project-root> [--output <path>] [--max-nodes 30]

Supports: TypeScript/JavaScript, Python, Go, Rust
Output: Mermaid diagram (printed to stdout or written to file)

This script is intentionally simple — it does static text analysis, not AST parsing.
It catches ~80% of imports, which is sufficient for architectural understanding.
"""

import os
import re
import sys
import json
from collections import defaultdict
from pathlib import Path

IGNORE_DIRS = {
    'node_modules', '.git', 'dist', 'build', '__pycache__',
    '.next', 'target', '.venv', 'venv', 'vendor', '.tox',
    'coverage', '.nyc_output', '.pytest_cache'
}

# Import patterns by language
IMPORT_PATTERNS = {
    # TypeScript/JavaScript: import ... from '...' or require('...')
    '.ts':  [r"from\s+['\"]([^'\"]+)['\"]", r"require\(\s*['\"]([^'\"]+)['\"]\s*\)"],
    '.tsx': [r"from\s+['\"]([^'\"]+)['\"]", r"require\(\s*['\"]([^'\"]+)['\"]\s*\)"],
    '.js':  [r"from\s+['\"]([^'\"]+)['\"]", r"require\(\s*['\"]([^'\"]+)['\"]\s*\)"],
    '.jsx': [r"from\s+['\"]([^'\"]+)['\"]", r"require\(\s*['\"]([^'\"]+)['\"]\s*\)"],
    # Python: from X import Y or import X
    '.py':  [r"^from\s+(\S+)\s+import", r"^import\s+(\S+)"],
    # Go: "package/path"
    '.go':  [r'"([^"]+)"'],
    # Rust: use crate::X or mod X
    '.rs':  [r"use\s+(crate::\S+)", r"use\s+(\S+::\S+)", r"mod\s+(\w+)"],
}


def should_ignore(path: Path) -> bool:
    return any(part in IGNORE_DIRS for part in path.parts)


def normalize_module(raw: str, file_path: Path, project_root: Path) -> str | None:
    """Normalize an import path to a module name. Returns None for external deps."""
    # Skip external/node_modules imports
    if raw.startswith('.'):
        # Relative import — resolve to absolute
        resolved = (file_path.parent / raw).resolve()
        try:
            rel = resolved.relative_to(project_root.resolve())
            parts = rel.parts
            # Trim to first 2 meaningful directories
            if len(parts) > 2:
                return '/'.join(parts[:2])
            return '/'.join(parts)
        except ValueError:
            return None
    elif '/' in raw and not raw.startswith('@'):
        # Looks like an internal path
        parts = raw.split('/')
        if len(parts) > 2:
            return '/'.join(parts[:2])
        return raw
    else:
        # External package — skip
        return None


def extract_imports(file_path: Path, project_root: Path) -> list[tuple[str, str]]:
    """Extract (source_module, target_module) pairs from a file."""
    ext = file_path.suffix
    patterns = IMPORT_PATTERNS.get(ext, [])
    if not patterns:
        return []

    # Source module
    try:
        rel = file_path.relative_to(project_root)
    except ValueError:
        return []

    parts = rel.parts
    if len(parts) > 2:
        source = '/'.join(parts[:2])
    else:
        source = '/'.join(parts[:-1]) if len(parts) > 1 else str(rel.stem)

    edges = []
    try:
        content = file_path.read_text(encoding='utf-8', errors='ignore')
    except (OSError, UnicodeDecodeError):
        return []

    for line in content.splitlines():
        for pattern in patterns:
            for match in re.finditer(pattern, line):
                raw = match.group(1)
                target = normalize_module(raw, file_path, project_root)
                if target and target != source:
                    edges.append((source, target))

    return edges


def build_graph(project_root: Path, max_nodes: int = 30) -> dict:
    """Build a module dependency graph."""
    all_edges = defaultdict(int)  # (src, dst) -> count
    all_nodes = set()

    for ext in IMPORT_PATTERNS:
        for file_path in project_root.rglob(f'*{ext}'):
            if should_ignore(file_path):
                continue
            for src, dst in extract_imports(file_path, project_root):
                all_edges[(src, dst)] += 1
                all_nodes.add(src)
                all_nodes.add(dst)

    # Prune to max_nodes by keeping the most connected nodes
    if len(all_nodes) > max_nodes:
        node_degree = defaultdict(int)
        for (src, dst), count in all_edges.items():
            node_degree[src] += count
            node_degree[dst] += count
        top_nodes = set(
            n for n, _ in sorted(node_degree.items(), key=lambda x: -x[1])[:max_nodes]
        )
        all_edges = {
            k: v for k, v in all_edges.items()
            if k[0] in top_nodes and k[1] in top_nodes
        }
        all_nodes = top_nodes

    return {
        'nodes': sorted(all_nodes),
        'edges': [
            {'from': src, 'to': dst, 'weight': count}
            for (src, dst), count in sorted(all_edges.items(), key=lambda x: -x[1])
        ]
    }


def to_mermaid(graph: dict) -> str:
    """Convert graph to Mermaid diagram."""
    lines = ['graph LR']

    # Sanitize node names for Mermaid
    def sanitize(name: str) -> str:
        return name.replace('/', '_').replace('-', '_').replace('.', '_')

    for node in graph['nodes']:
        safe = sanitize(node)
        lines.append(f'  {safe}["{node}"]')

    for edge in graph['edges']:
        src = sanitize(edge['from'])
        dst = sanitize(edge['to'])
        weight = edge['weight']
        if weight > 3:
            lines.append(f'  {src} ==> {dst}')  # thick arrow for heavy deps
        else:
            lines.append(f'  {src} --> {dst}')

    return '\n'.join(lines)


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Generate Mermaid dependency diagram')
    parser.add_argument('project_root', help='Project root directory')
    parser.add_argument('--output', '-o', help='Output file path (default: stdout)')
    parser.add_argument('--max-nodes', type=int, default=30, help='Max nodes in diagram')
    parser.add_argument('--json', action='store_true', help='Output raw JSON instead of Mermaid')
    args = parser.parse_args()

    project_root = Path(args.project_root).resolve()
    if not project_root.is_dir():
        print(f"Error: {project_root} is not a directory", file=sys.stderr)
        sys.exit(1)

    graph = build_graph(project_root, args.max_nodes)

    if args.json:
        output = json.dumps(graph, indent=2)
    else:
        output = to_mermaid(graph)

    if args.output:
        Path(args.output).write_text(output)
        print(f"Wrote diagram to {args.output}", file=sys.stderr)
    else:
        print(output)


if __name__ == '__main__':
    main()

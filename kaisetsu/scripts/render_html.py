#!/usr/bin/env python3
"""Validate a Gemini semantic fragment and wrap it in the kaisetsu HTML shell."""

from __future__ import annotations

import re
import sys
from html.parser import HTMLParser
from pathlib import Path


ALLOWED_TAGS = {
    "a",
    "abbr",
    "article",
    "aside",
    "blockquote",
    "br",
    "caption",
    "circle",
    "code",
    "dd",
    "defs",
    "details",
    "desc",
    "div",
    "dl",
    "dt",
    "ellipse",
    "em",
    "figcaption",
    "figure",
    "footer",
    "g",
    "h1",
    "h2",
    "h3",
    "h4",
    "header",
    "hr",
    "kbd",
    "li",
    "line",
    "main",
    "mark",
    "ol",
    "p",
    "path",
    "polygon",
    "polyline",
    "pre",
    "rect",
    "samp",
    "section",
    "small",
    "span",
    "strong",
    "summary",
    "svg",
    "table",
    "tbody",
    "td",
    "text",
    "tfoot",
    "th",
    "thead",
    "time",
    "title",
    "tr",
    "ul",
    "var",
}

VOID_TAGS = {"br", "hr"}
SVG_EMPTY_TAGS = {"circle", "ellipse", "line", "path", "polygon", "polyline", "rect"}
SVG_TAGS = SVG_EMPTY_TAGS | {"defs", "desc", "g", "text", "title"}
GLOBAL_ATTRIBUTES = {"class", "id", "lang", "role", "title"}
HTML_ATTRIBUTES = {
    "a": {"href"},
    "details": {"open"},
    "ol": {"reversed", "start", "type"},
    "td": {"colspan", "rowspan"},
    "th": {"colspan", "rowspan", "scope"},
    "time": {"datetime"},
}
SVG_ATTRIBUTES = {
    "aria-hidden",
    "aria-label",
    "aria-labelledby",
    "cx",
    "cy",
    "d",
    "fill",
    "height",
    "points",
    "preserveaspectratio",
    "r",
    "rx",
    "ry",
    "stroke",
    "stroke-dasharray",
    "stroke-linecap",
    "stroke-linejoin",
    "stroke-width",
    "transform",
    "viewbox",
    "width",
    "x",
    "x1",
    "x2",
    "y",
    "y1",
    "y2",
}
DATA_VALUES = {
    "data-epistemic": {"fact", "decision", "inference", "unknown"},
    "data-section": {"explanation-gaps"},
    "data-stage": {"before", "discovery", "after"},
}
TOKEN_LIST = re.compile(r"^[a-zA-Z0-9_-]+(?:\s+[a-zA-Z0-9_-]+)*$")
ID_VALUE = re.compile(r"^[a-zA-Z][a-zA-Z0-9_-]*$")


class FragmentError(ValueError):
    pass


class FragmentValidator(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=False)
        self.stack: list[str] = []
        self.root_count = 0
        self.gaps_count = 0
        self.gaps_depth: int | None = None
        self.gaps_has_text = False
        self.reconstruction_has_text = False
        self.ids: dict[str, str] = {}
        self.svg_label_refs: list[list[str]] = []

    def error(self, message: str) -> None:
        raise FragmentError(message)

    def handle_decl(self, decl: str) -> None:
        self.error(f"declarations are not allowed: {decl}")

    def unknown_decl(self, data: str) -> None:
        self.error(f"unknown declarations are not allowed: {data}")

    def handle_pi(self, data: str) -> None:
        self.error("processing instructions are not allowed")

    def handle_comment(self, data: str) -> None:
        self.error("HTML comments are not allowed")

    def handle_data(self, data: str) -> None:
        if not self.stack and data.strip():
            self.error("text is not allowed outside the <main> root")
        if self.stack and data.strip():
            if self.gaps_depth is not None and len(self.stack) >= self.gaps_depth:
                self.gaps_has_text = True
            else:
                self.reconstruction_has_text = True

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self._open_tag(tag, attrs, self_closing=tag in VOID_TAGS)

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag not in VOID_TAGS | SVG_EMPTY_TAGS:
            self.error(f"self-closing <{tag}/> is not supported")
        self._open_tag(tag, attrs, self_closing=True)

    def handle_endtag(self, tag: str) -> None:
        if tag in VOID_TAGS | SVG_EMPTY_TAGS:
            self.error(f"unexpected closing tag </{tag}>")
        if not self.stack:
            self.error(f"unexpected closing tag </{tag}>")
        expected = self.stack[-1]
        if tag != expected:
            self.error(f"mismatched closing tag </{tag}>; expected </{expected}>")
        self.stack.pop()
        if self.gaps_depth is not None and len(self.stack) < self.gaps_depth:
            self.gaps_depth = None

    def close(self) -> None:
        super().close()
        if self.stack:
            self.error(f"unclosed tag <{self.stack[-1]}>")
        if self.root_count != 1:
            self.error("fragment must contain exactly one top-level <main> root")
        if self.gaps_count != 1:
            self.error(
                'fragment must contain exactly one <section data-section="explanation-gaps">'
            )
        if not self.reconstruction_has_text:
            self.error("reader-facing reconstruction must contain text")
        if not self.gaps_has_text:
            self.error("explanation-gaps section must contain text")
        for refs in self.svg_label_refs:
            if any(ref not in self.ids for ref in refs):
                self.error("svg aria-labelledby must reference IDs in the fragment")
            if not any(self.ids[ref] in {"title", "desc"} for ref in refs):
                self.error("svg aria-labelledby must reference a <title> or <desc>")

    def _open_tag(
        self,
        tag: str,
        attrs: list[tuple[str, str | None]],
        *,
        self_closing: bool,
    ) -> None:
        if tag not in ALLOWED_TAGS:
            self.error(f"element <{tag}> is not allowed")

        in_svg = "svg" in self.stack
        if tag == "svg" and in_svg:
            self.error("nested <svg> elements are not allowed")
        if tag in SVG_TAGS and not in_svg:
            self.error(f"<{tag}> is allowed only inside <svg>")
        if in_svg and tag not in SVG_TAGS:
            self.error(f"HTML element <{tag}> is not allowed inside <svg>")

        if not self.stack:
            if tag != "main" or self_closing:
                self.error("the only top-level element must be a non-empty <main>")
            self.root_count += 1
            if self.root_count > 1:
                self.error("fragment contains more than one top-level element")
        elif tag == "main":
            self.error("nested <main> elements are not allowed")

        seen: set[str] = set()
        attr_map: dict[str, str | None] = {}
        for name, value in attrs:
            if name in seen:
                self.error(f"duplicate attribute {name!r} on <{tag}>")
            seen.add(name)
            attr_map[name] = value
            self._validate_attribute(tag, name, value)

        if tag == "section" and attr_map.get("data-section") == "explanation-gaps":
            self.gaps_count += 1
            self.gaps_depth = len(self.stack) + 1
        if "id" in attr_map:
            element_id = attr_map["id"]
            assert element_id is not None
            if element_id in self.ids:
                self.error(f"duplicate id {element_id!r}")
            self.ids[element_id] = tag
        if tag == "svg":
            if attr_map.get("role") != "img":
                self.error('inline <svg> must use role="img"')
            labelledby = attr_map.get("aria-labelledby")
            if labelledby is None or not TOKEN_LIST.fullmatch(labelledby):
                self.error("inline <svg> must have a valid aria-labelledby value")
            self.svg_label_refs.append(labelledby.split())

        if not self_closing and tag not in VOID_TAGS:
            self.stack.append(tag)

    def _validate_attribute(self, tag: str, name: str, value: str | None) -> None:
        if name.startswith("on") or name == "style":
            self.error(f"attribute {name!r} is not allowed")

        allowed = (
            name in GLOBAL_ATTRIBUTES
            or name in HTML_ATTRIBUTES.get(tag, set())
            or name in DATA_VALUES
            or name.startswith("aria-")
            or (tag in SVG_TAGS | {"svg"} and name in SVG_ATTRIBUTES)
        )
        if not allowed:
            self.error(f"attribute {name!r} is not allowed on <{tag}>")

        if value is not None and "url(" in value.lower():
            self.error(f"external or embedded CSS URL is not allowed in {name!r}")

        if name == "href" and (value is None or not value.startswith("#")):
            self.error("links must be local fragment references beginning with '#'")
        if name == "class" and (value is None or not TOKEN_LIST.fullmatch(value)):
            self.error("class must be a space-separated list of simple tokens")
        if name == "id" and (value is None or not ID_VALUE.fullmatch(value)):
            self.error("id must be a simple HTML identifier")
        if name in DATA_VALUES and value not in DATA_VALUES[name]:
            expected = ", ".join(sorted(DATA_VALUES[name]))
            self.error(f"{name} must be one of: {expected}")


SHELL_PREFIX = """<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src 'none'; script-src 'none'; connect-src 'none'; media-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'">
  <title>kaisetsu — technical reconstruction</title>
  <style>
    :root {
      color-scheme: light dark;
      --canvas: #f5f7fa;
      --surface: #ffffff;
      --surface-muted: #f0f3f7;
      --text: #18202a;
      --muted: #5d6875;
      --line: #d7dee7;
      --accent: #235fa4;
      --fact: #16705a;
      --decision: #7b4db0;
      --inference: #986515;
      --unknown: #a33b46;
      --code: #edf1f5;
      --shadow: 0 14px 40px rgba(24, 32, 42, 0.08);
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --canvas: #11151a;
        --surface: #181e25;
        --surface-muted: #202832;
        --text: #e8edf2;
        --muted: #aeb8c4;
        --line: #34404d;
        --accent: #83b7f1;
        --fact: #65c7ab;
        --decision: #c39aee;
        --inference: #e1b662;
        --unknown: #ef8992;
        --code: #232c36;
        --shadow: none;
      }
    }

    * { box-sizing: border-box; }
    html { background: var(--canvas); }
    body {
      margin: 0;
      min-width: 280px;
      overflow-x: hidden;
      color: var(--text);
      background: var(--canvas);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 16px;
      line-height: 1.7;
      text-rendering: optimizeLegibility;
    }
    main {
      width: min(100% - 32px, 980px);
      min-width: 0;
      margin: 32px auto;
      padding: clamp(24px, 4vw, 52px);
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: 14px;
      box-shadow: var(--shadow);
    }
    header { margin-block-end: 2.2rem; }
    section + section { margin-block-start: 2.5rem; }
    section { min-width: 0; }
    h1, h2, h3, h4 { line-height: 1.3; letter-spacing: -0.015em; }
    h1 { margin: 0 0 0.8rem; font-size: clamp(1.85rem, 4vw, 2.7rem); }
    h2 { margin: 0 0 1rem; padding-block-end: 0.45rem; border-bottom: 1px solid var(--line); font-size: 1.45rem; }
    h3 { margin: 1.5rem 0 0.55rem; font-size: 1.12rem; }
    h4 { margin: 1.2rem 0 0.45rem; font-size: 1rem; }
    p, ul, ol, dl, blockquote { max-width: 76ch; }
    p { margin: 0.75rem 0; }
    p, li, dt, dd, th, td, figcaption { overflow-wrap: anywhere; }
    ul, ol { padding-inline-start: 1.45rem; }
    li + li { margin-block-start: 0.35rem; }
    .lede { color: var(--muted); font-size: 1.08rem; }
    .kicker { margin: 0 0 0.35rem; color: var(--accent); font-size: 0.78rem; font-weight: 750; letter-spacing: 0.08em; text-transform: uppercase; }
    .callout, blockquote, article[data-epistemic], aside[data-epistemic], div[data-epistemic] {
      margin: 1rem 0;
      padding: 0.9rem 1rem;
      background: var(--surface-muted);
      border-inline-start: 4px solid var(--accent);
      border-radius: 0 8px 8px 0;
    }
    [data-epistemic]::before {
      display: block;
      margin-block-end: 0.35rem;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.08em;
    }
    [data-epistemic="fact"] { border-color: var(--fact); }
    [data-epistemic="fact"]::before { color: var(--fact); content: "VERIFIED FACT"; }
    [data-epistemic="decision"] { border-color: var(--decision); }
    [data-epistemic="decision"]::before { color: var(--decision); content: "TECHNICAL DECISION"; }
    [data-epistemic="inference"] { border-color: var(--inference); }
    [data-epistemic="inference"]::before { color: var(--inference); content: "INFERENCE"; }
    [data-epistemic="unknown"] { border-color: var(--unknown); }
    [data-epistemic="unknown"]::before { color: var(--unknown); content: "UNRESOLVED"; }
    .learning-flow, section.cards, div.cards, section.flow, div.flow {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 12px;
      margin: 1.2rem 0;
    }
    .learning-flow > :is(h1, h2, h3), section.cards > :is(h1, h2, h3), div.cards > :is(h1, h2, h3), section.flow > :is(h1, h2, h3), div.flow > :is(h1, h2, h3) {
      grid-column: 1 / -1;
    }
    .learning-flow > [data-stage], section.cards > article, div.cards > article, section.flow > :is(article, div), div.flow > :is(article, div) {
      min-width: 0;
      padding: 1rem;
      background: var(--surface-muted);
      border: 1px solid var(--line);
      border-radius: 9px;
    }
    [data-stage]::before {
      display: block;
      margin-block-end: 0.45rem;
      color: var(--muted);
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.08em;
    }
    [data-stage="before"]::before { content: "BEFORE"; }
    [data-stage="discovery"]::before { content: "DISCOVERY"; }
    [data-stage="after"]::before { content: "AFTER"; }
    code, kbd, samp, pre {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.9em;
    }
    :not(pre) > code, kbd, samp {
      padding: 0.12em 0.36em;
      overflow-wrap: anywhere;
      background: var(--code);
      border: 1px solid var(--line);
      border-radius: 4px;
    }
    pre {
      max-width: 100%;
      margin: 1rem 0;
      padding: 1rem;
      overflow-x: auto;
      color: var(--text);
      background: var(--code);
      border: 1px solid var(--line);
      border-radius: 9px;
      line-height: 1.55;
      tab-size: 2;
      white-space: pre;
    }
    pre code { font-size: inherit; }
    .diff { border-inline-start: 4px solid var(--accent); }
    .tree { line-height: 1.65; }
    table {
      display: block;
      width: 100%;
      margin: 1rem 0;
      overflow-x: auto;
      border-collapse: collapse;
      font-size: 0.94rem;
    }
    caption { margin-block-end: 0.55rem; color: var(--muted); text-align: start; }
    th, td { min-width: 8rem; padding: 0.7rem 0.8rem; border: 1px solid var(--line); text-align: start; vertical-align: top; }
    th { background: var(--surface-muted); font-weight: 700; }
    dt { margin-block-start: 0.8rem; font-weight: 700; }
    dd { margin-inline-start: 1.2rem; color: var(--muted); }
    mark { padding: 0 0.18em; color: inherit; background: var(--surface-muted); background: color-mix(in srgb, var(--inference) 24%, transparent); }
    hr { margin: 2.2rem 0; border: 0; border-top: 1px solid var(--line); }
    details { margin: 1rem 0; padding: 0.8rem 1rem; border: 1px solid var(--line); border-radius: 8px; }
    summary { cursor: pointer; font-weight: 700; }
    figure { margin: 1.2rem 0; }
    figcaption { margin-block-start: 0.5rem; color: var(--muted); font-size: 0.9rem; }
    svg { display: block; width: 100%; max-width: 760px; height: auto; color: var(--text); }
    .explanation-gaps { padding: 1rem; background: var(--surface-muted); background: color-mix(in srgb, var(--unknown) 7%, var(--surface)); border: 1px solid var(--line); border-color: color-mix(in srgb, var(--unknown) 38%, var(--line)); border-radius: 10px; }
    small, .muted { color: var(--muted); }

    @media (max-width: 620px) {
      main { width: 100%; margin: 0; padding: 22px 16px 36px; border-inline: 0; border-radius: 0; }
      .learning-flow, section.cards, div.cards, section.flow, div.flow { grid-template-columns: 1fr; }
      th, td { min-width: 7rem; padding: 0.55rem 0.6rem; }
    }

    @media print {
      html, body { background: #fff; }
      main { width: 100%; margin: 0; border: 0; box-shadow: none; }
    }
  </style>
</head>
<body>
"""

SHELL_SUFFIX = """
</body>
</html>
"""


def render(fragment: str) -> str:
    if not fragment.strip():
        raise FragmentError("fragment is empty")
    if any(ord(character) < 32 and character not in "\t\n\r" for character in fragment):
        raise FragmentError("fragment contains disallowed control characters")
    validator = FragmentValidator()
    validator.feed(fragment)
    validator.close()
    return SHELL_PREFIX + fragment.strip() + SHELL_SUFFIX


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("usage: render_html.py FRAGMENT_FILE", file=sys.stderr)
        return 2

    fragment_path = Path(argv[1])
    try:
        fragment = fragment_path.read_text(encoding="utf-8")
        document = render(fragment)
    except (OSError, UnicodeError, FragmentError) as exc:
        print(f"render_html.py: invalid semantic HTML fragment: {exc}", file=sys.stderr)
        return 1

    sys.stdout.write(document)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))

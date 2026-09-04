#!/usr/bin/env python3

from __future__ import annotations

import importlib.util
import json
import os
import stat
import subprocess
import tempfile
import unittest
from pathlib import Path


SKILL_DIR = Path(__file__).resolve().parents[1]
HELPER = SKILL_DIR / "scripts" / "kaisetsu.sh"
RENDERER = SKILL_DIR / "scripts" / "render_html.py"

SPEC = importlib.util.spec_from_file_location("kaisetsu_render_html", RENDERER)
assert SPEC is not None and SPEC.loader is not None
RENDER_MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(RENDER_MODULE)


PROSE_FRAGMENT = """<main>
  <header><h1>原因は終了順序にある</h1></header>
  <section><p>cleanup が response の保存より先に走るため、結果が失われた。</p></section>
  <section class="explanation-gaps" data-section="explanation-gaps">
    <h2>説明上の未解決点</h2><p>重要な未解決点はない。</p>
  </section>
</main>"""

COMPARISON_FRAGMENT = """<main>
  <header><h1>所有権の比較</h1></header>
  <table><caption>候補</caption><thead><tr><th scope="col">案</th><th scope="col">所有者</th></tr></thead><tbody><tr><td>A</td><td>caller</td></tr></tbody></table>
  <article data-epistemic="decision"><p>A を採用した。</p></article>
  <section class="explanation-gaps" data-section="explanation-gaps"><p>負荷測定は未実施。</p></section>
</main>"""

LEARNING_FRAGMENT = """<main>
  <h1>実装で変わった理解</h1>
  <section class="learning-flow">
    <article data-stage="before"><p>同期処理だと考えた。</p></article>
    <article data-stage="discovery"><p>非同期 callback を観測した。</p></article>
    <article data-stage="after"><p>lifecycle 所有者を変更した。</p></article>
  </section>
  <section class="explanation-gaps" data-section="explanation-gaps"><p>別 OS は未検証。</p></section>
</main>"""

SVG_FRAGMENT = """<main>
  <h1>所有権の方向</h1>
  <figure>
    <svg role="img" aria-labelledby="flow-title flow-desc" viewBox="0 0 320 80">
      <title id="flow-title">response の所有権移動</title>
      <desc id="flow-desc">worker から success path へ向かう線</desc>
      <line x1="20" y1="40" x2="300" y2="40" stroke="currentColor" stroke-width="2" />
      <text x="20" y="28">worker</text><text x="220" y="28">success path</text>
    </svg>
    <figcaption>publication は success path が所有する。</figcaption>
  </figure>
  <section class="explanation-gaps" data-section="explanation-gaps"><p>未解決点はない。</p></section>
</main>"""


class RendererTests(unittest.TestCase):
    def test_wraps_prose_fragment_in_self_contained_shell(self) -> None:
        document = RENDER_MODULE.render(PROSE_FRAGMENT)

        self.assertTrue(document.startswith("<!doctype html>"))
        self.assertIn("Content-Security-Policy", document)
        self.assertIn("prefers-color-scheme: dark", document)
        self.assertIn(PROSE_FRAGMENT, document)
        self.assertNotIn("<script", document.lower())
        self.assertNotIn("<link", document.lower())

    def test_accepts_comparison_and_learning_representations(self) -> None:
        comparison = RENDER_MODULE.render(COMPARISON_FRAGMENT)
        learning = RENDER_MODULE.render(LEARNING_FRAGMENT)
        svg = RENDER_MODULE.render(SVG_FRAGMENT)

        self.assertIn("<table>", comparison)
        self.assertIn('data-epistemic="decision"', comparison)
        self.assertIn('data-stage="discovery"', learning)
        self.assertIn('aria-labelledby="flow-title flow-desc"', svg)

    def test_rejects_incomplete_or_unsafe_fragments(self) -> None:
        invalid_fragments = {
            "full document": f"<!doctype html><html><body>{PROSE_FRAGMENT}</body></html>",
            "markdown fence": f"```html\n{PROSE_FRAGMENT}\n```",
            "script": PROSE_FRAGMENT.replace("</main>", "<script>alert(1)</script></main>"),
            "external link": PROSE_FRAGMENT.replace(
                "原因は終了順序にある", '<a href="https://example.com">外部</a>'
            ),
            "style attribute": PROSE_FRAGMENT.replace("<main>", '<main style="color:red">'),
            "missing gaps": "<main><p>再構成だけ</p></main>",
            "empty gaps": '<main><p>再構成</p><section data-section="explanation-gaps"></section></main>',
            "empty reconstruction": '<main><section data-section="explanation-gaps"><p>未解決点なし</p></section></main>',
            "mismatched tags": '<main><p>再構成</main><section data-section="explanation-gaps"><p>なし</p></section>',
            "comment": PROSE_FRAGMENT.replace("<main>", "<main><!-- hidden -->"),
            "svg without accessible name": PROSE_FRAGMENT.replace(
                "</main>", '<svg viewBox="0 0 10 10"><line x1="0" y1="0" x2="10" y2="10" /></svg></main>'
            ),
            "svg shape outside svg": PROSE_FRAGMENT.replace(
                "</main>", '<line x1="0" y1="0" x2="10" y2="10" /></main>'
            ),
            "control character": PROSE_FRAGMENT.replace("原因", "原\x00因"),
        }

        for label, fragment in invalid_fragments.items():
            with self.subTest(label=label):
                with self.assertRaises(RENDER_MODULE.FragmentError):
                    RENDER_MODULE.render(fragment)


class HelperIntegrationTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tempdir = tempfile.TemporaryDirectory()
        self.root = Path(self.tempdir.name)
        self.bin_dir = self.root / "bin"
        self.bin_dir.mkdir()
        self.packet = self.root / "packet.txt"
        self.packet.write_text("<EXPLANATION_PACKET>\nTASK\nテスト\n</EXPLANATION_PACKET>\n")
        self.events = self.root / "events.ndjson"
        self.prompt_capture = self.root / "input.ndjson"
        self.open_args = self.root / "open.args"
        self.before_artifacts = set(Path("/tmp").glob("kaisetsu.*.html"))
        self._write_executable(
            self.bin_dir / "agy",
            "#!/bin/sh\n/bin/cat > \"$KAITEST_PROMPT_CAPTURE\"\n/bin/cat \"$KAITEST_EVENTS\"\nexit \"${KAITEST_AGY_STATUS:-0}\"\n",
        )
        self._write_executable(
            self.bin_dir / "open",
            "#!/bin/sh\nprintf '%s\\n' \"$@\" > \"$KAITEST_OPEN_ARGS\"\nexit \"${KAITEST_OPEN_STATUS:-0}\"\n",
        )
        self.artifacts: list[Path] = []

    def tearDown(self) -> None:
        for artifact in self.artifacts:
            artifact.unlink(missing_ok=True)
        self.tempdir.cleanup()

    def _write_executable(self, path: Path, content: str) -> None:
        path.write_text(content)
        path.chmod(path.stat().st_mode | stat.S_IXUSR)

    def _run(
        self,
        response: str,
        *,
        result_status: str = "SUCCESS",
        agy_status: int = 0,
        open_status: int = 0,
    ) -> subprocess.CompletedProcess[str]:
        result: dict[str, object] = {
            "status": result_status,
            "response": response,
            "usage": {"input_tokens": 12, "output_tokens": 34},
        }
        if result_status != "SUCCESS":
            result["error"] = "stubbed upstream failure"
        self.events.write_text(json.dumps({"event": "result", "result": result}) + "\n")

        env = os.environ.copy()
        env.update(
            {
                "PATH": f"{self.bin_dir}{os.pathsep}{env['PATH']}",
                "KAITEST_EVENTS": str(self.events),
                "KAITEST_PROMPT_CAPTURE": str(self.prompt_capture),
                "KAITEST_OPEN_ARGS": str(self.open_args),
                "KAITEST_AGY_STATUS": str(agy_status),
                "KAITEST_OPEN_STATUS": str(open_status),
                "PYTHONDONTWRITEBYTECODE": "1",
            }
        )
        completed = subprocess.run(
            ["bash", str(HELPER), str(self.packet)],
            text=True,
            capture_output=True,
            env=env,
            check=False,
        )
        if self.open_args.exists():
            args = self.open_args.read_text().splitlines()
            if args:
                self.artifacts.append(Path(args[-1]))
        return completed

    def test_success_preserves_raw_fragment_and_opens_complete_html(self) -> None:
        completed = self._run(COMPARISON_FRAGMENT)

        self.assertEqual(completed.returncode, 0, completed.stderr)
        result = json.loads(completed.stdout)
        self.assertEqual(result["response"], COMPARISON_FRAGMENT)

        args = self.open_args.read_text().splitlines()
        self.assertEqual(len(args), 1)
        artifact = Path(args[0])
        self.assertRegex(str(artifact), r"^/tmp/kaisetsu\.[A-Za-z0-9]{6}\.html$")
        self.assertTrue(artifact.is_file())
        self.assertEqual(stat.S_IMODE(artifact.stat().st_mode), 0o600)
        document = artifact.read_text()
        self.assertTrue(document.startswith("<!doctype html>"))
        self.assertIn(COMPARISON_FRAGMENT, document)

        input_event = json.loads(self.prompt_capture.read_text())
        prompt = input_event["message"]["content"]
        self.assertIn("Prose is not mandatory and is not privileged.", prompt)
        self.assertIn("before -> discovery -> after", prompt)
        self.assertIn('data-section="explanation-gaps"', prompt)
        self.assertIn("Do not emit Mermaid", prompt)

    def test_open_failure_is_warning_after_success(self) -> None:
        completed = self._run(PROSE_FRAGMENT, open_status=1)

        self.assertEqual(completed.returncode, 0, completed.stderr)
        self.assertEqual(json.loads(completed.stdout)["response"], PROSE_FRAGMENT)
        self.assertRegex(
            completed.stderr,
            r"warning: could not open response file: /tmp/kaisetsu\.[A-Za-z0-9]{6}\.html",
        )

    def test_invalid_fragment_is_neither_published_nor_opened(self) -> None:
        completed = self._run("<main><p>truncated")

        self.assertNotEqual(completed.returncode, 0)
        self.assertFalse(self.open_args.exists())
        self.assertIn("not a valid kaisetsu HTML fragment", completed.stderr)
        self.assertEqual(completed.stdout, "")
        self.assertEqual(set(Path("/tmp").glob("kaisetsu.*.html")), self.before_artifacts)

    def test_structured_error_is_not_rendered_or_opened(self) -> None:
        completed = self._run("partial", result_status="ERROR", agy_status=1)

        self.assertNotEqual(completed.returncode, 0)
        self.assertFalse(self.open_args.exists())
        self.assertIn("stubbed upstream failure", completed.stderr)
        self.assertEqual(completed.stdout, "")


if __name__ == "__main__":
    unittest.main()

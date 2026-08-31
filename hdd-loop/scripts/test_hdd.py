#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RUNNER = ROOT / "scripts" / "hdd.py"

spec = importlib.util.spec_from_file_location("hdd_loop_runner", RUNNER)
assert spec and spec.loader
hdd = importlib.util.module_from_spec(spec)
spec.loader.exec_module(hdd)


def check_diegetic_compilation() -> None:
    with tempfile.TemporaryDirectory() as td:
        ws = Path(td) / ".hdd"
        ws.mkdir()
        (ws / "iterations").mkdir()
        (ws / "outbox").mkdir()
        (ws / "seed.md").write_text(
            "An unfamiliar CLI is installed. Use it on a real development task.\n",
            encoding="utf-8",
        )
        (ws / "artifact.md").write_text(
            "## Dream Iteration 4: Meta framing\n"
            "We are under Red Pen 0004 pressure.\n"
            "$ vc inspect A\nOBSERVED: candidate A materialized.\n",
            encoding="utf-8",
        )
        ledger = hdd.default_ledger()
        ledger["preserve"] = ["Concurrent candidates can be executed before integration."]
        ledger["established"] = ["The tool can materialize opaque candidate bundles."]
        ledger["rejected"] = ["A hidden semantic entity registry does not exist."]
        ledger["constraints"] = ["At most six executable environments are available."]
        ledger["open_questions"] = ["SECRET OPEN QUESTION SHOULD NOT LEAK"]
        ledger["harvest_candidates"] = ["SECRET HARVEST SHOULD NOT LEAK"]
        ledger["human_pressure"] = ["Keep the interface as a one-shot CLI."]
        ledger["last_pressure"] = ["Candidate labels encode no history or semantics."]
        ledger["affordance_assessment"] = {
            "classification": "THIN_WRAPPER",
            "core_operation": "attach one explicit file to one fresh agent invocation",
            "nearest_existing_operation": "SECRET ORDINARY WORKFLOW",
            "observable_delta": "SECRET DELTA",
            "reason": "Reality-Stripped assessment found no distinct execution capability.",
            "iteration": 4,
        }
        hdd.save_ledger(ws, ledger)

        prompt = hdd.compose_dreamer_prompt(ws, ledger)
        forbidden = [
            "HDD",
            "Red Pen",
            "Dream Iteration",
            "SECRET OPEN QUESTION",
            "SECRET HARVEST",
            "THIN_WRAPPER",
            "SECRET ORDINARY WORKFLOW",
            "SECRET DELTA",
            "Affordance Assessment",
            "Reality-Stripped",
        ]
        for token in forbidden:
            assert token.lower() not in prompt.lower(), token
        required = [
            "candidate A materialized",
            "hidden semantic entity registry does not exist",
            "six executable environments",
            "one-shot CLI",
            "encode no history or semantics",
        ]
        for token in required:
            assert token.lower() in prompt.lower(), token

        critic = hdd.compose_critic_prompt(ws, ledger, "raw dream output")
        assert "Ledger Before This Iteration" in critic
        assert "Dreamer Output To Review" in critic
        assert "Affordance Assessment" in critic
        assert "THIN_WRAPPER" in critic
        assert "SECRET ORDINARY WORKFLOW" in critic
        assert "SECRET DELTA" in critic

        harvest = hdd.compose_harvest_prompt(ws, ledger)
        assert "Affordance Assessment" in harvest
        assert "THIN_WRAPPER" in harvest
        assert "SECRET ORDINARY WORKFLOW" in harvest
        assert "SECRET DELTA" in harvest
        for section in (
            "# Affordance Classification",
            "# Nearest Existing Operation",
            "# Observable Delta",
        ):
            assert section in harvest
        assert "Do not upgrade the affordance classification" in harvest
        assert 'Do not invent a "Why Existing Tools Are Not Enough" argument' in harvest



def check_reference_migration() -> None:
    reference = ROOT / "references" / "raw" / "vc-witness-hdd-loop.jsonl"
    records = [json.loads(line) for line in reference.read_text(encoding="utf-8").splitlines()]
    latest = max((r for r in records if r["kind"] == "dreamer"), key=lambda r: r["iteration"])
    ledger = hdd.default_ledger()
    mapping = {
        "preserve_add": "preserve",
        "established_add": "established",
        "rejected_add": "rejected",
        "constraints_add": "constraints",
        "open_questions_add": "open_questions",
        "harvest_candidates_add": "harvest_candidates",
    }
    for record in records:
        if record["kind"] != "redpen":
            continue
        patch = record["payload"]
        for source, target in mapping.items():
            hdd.unique_append(ledger[target], patch.get(source, []))
        ledger["last_pressure"] = patch.get("pressure", [])
    with tempfile.TemporaryDirectory() as td:
        ws = Path(td) / ".hdd"
        ws.mkdir(); (ws / "iterations").mkdir(); (ws / "outbox").mkdir()
        (ws / "seed.md").write_text("An unfamiliar version-control tool is installed. Use it.\n", encoding="utf-8")
        (ws / "artifact.md").write_text(latest["payload"]["text"], encoding="utf-8")
        (ws / "redpen.md").write_text("", encoding="utf-8")
        hdd.save_ledger(ws, ledger)
        prompt = hdd.compose_dreamer_prompt(ws, ledger)
        for token in ("Red Pen", "Dream Iteration", "Harvest Candidates", "Stop Dreaming", "Grounding Gate"):
            assert token.lower() not in prompt.lower(), token


def check_affordance_assessment() -> None:
    with tempfile.TemporaryDirectory() as td:
        ws = Path(td) / ".hdd"
        ws.mkdir()
        (ws / "iterations").mkdir()
        (ws / "outbox").mkdir()

        legacy_ledger = hdd.default_ledger()
        legacy_ledger.pop("affordance_assessment")
        (ws / "ledger.json").write_text(
            json.dumps(legacy_ledger, ensure_ascii=False),
            encoding="utf-8",
        )
        ledger = hdd.load_ledger(ws)
        assert ledger["affordance_assessment"] is None

        legacy_patch = {"summary": "legacy critic response"}
        assert hdd.validate_patch(legacy_patch)["affordance_assessment"] is None
        assert hdd.validate_patch({"affordance_assessment": None})["affordance_assessment"] is None
        hdd.apply_patch(ws, ledger, legacy_patch, 1)
        assert ledger["affordance_assessment"] is None

        assessment = {
            "classification": "THIN_WRAPPER",
            "core_operation": "attach one explicit file to one fresh agent invocation",
            "nearest_existing_operation": "start a fresh agent session with that file attached",
            "observable_delta": "persistent archive-status metadata only",
            "reason": "no distinct execution capability has been established",
        }
        normalized = hdd.validate_patch({"affordance_assessment": assessment})
        assert normalized["affordance_assessment"] == assessment
        padded = {key: f"  {value}  " for key, value in assessment.items()}
        assert hdd.validate_patch({"affordance_assessment": padded})[
            "affordance_assessment"
        ] == assessment

        invalid = dict(assessment)
        invalid["classification"] = "SUPER_NOVEL"
        try:
            hdd.validate_patch({"affordance_assessment": invalid})
        except hdd.HDDException:
            pass
        else:
            raise AssertionError("unknown affordance classification was accepted")

        hdd.apply_patch(
            ws,
            ledger,
            {"summary": "reality-stripped assessment", "affordance_assessment": assessment},
            2,
        )
        expected = {**assessment, "iteration": 2}
        persisted = json.loads((ws / "ledger.json").read_text(encoding="utf-8"))
        assert persisted["affordance_assessment"] == expected
        assert persisted["history"][-1]["affordance_assessment"] == expected
        assert "affordance_assessment" not in persisted["history"][-2]
        persisted_patch = json.loads(
            (ws / "iterations" / "0002-redpen.json").read_text(encoding="utf-8")
        )
        assert persisted_patch["affordance_assessment"] == assessment
        ledger_markdown = (ws / "ledger.md").read_text(encoding="utf-8")
        for token in (
            "## Affordance Assessment",
            "Classification: THIN_WRAPPER",
            "Core operation: attach one explicit file",
            "Nearest existing operation: start a fresh agent session",
            "Observable delta: persistent archive-status metadata only",
            "Reason: no distinct execution capability has been established",
            "Assessed at iteration: 2",
        ):
            assert token in ledger_markdown, token
        redpen_markdown = (ws / "iterations" / "0002-redpen.md").read_text(encoding="utf-8")
        assert "## Affordance Assessment" in redpen_markdown
        assert "Assessed at iteration: 2" in redpen_markdown

        hdd.apply_patch(ws, ledger, {"summary": "no new assessment"}, 3)
        assert ledger["affordance_assessment"] == expected
        assert "affordance_assessment" not in ledger["history"][-1]
        assert hdd.load_ledger(ws)["affordance_assessment"] == expected

        replacement = {
            "classification": "USEFUL_COMPOSITION",
            "core_operation": "run a bounded provenance inspection as one contract",
            "nearest_existing_operation": "combine debugger tracing and log correlation manually",
            "observable_delta": "the bounded inspection contract is reusable across runs",
            "reason": "the primitives are known but the combined contract remains useful",
        }
        hdd.apply_patch(ws, ledger, {"affordance_assessment": replacement}, 4)
        replacement_with_iteration = {**replacement, "iteration": 4}
        assert ledger["affordance_assessment"] == replacement_with_iteration
        assert ledger["history"][-1]["affordance_assessment"] == replacement_with_iteration
        assert hdd.load_ledger(ws)["affordance_assessment"] == replacement_with_iteration


def check_manual_cli() -> None:
    with tempfile.TemporaryDirectory() as td:
        ws = Path(td) / ".hdd"
        env = os.environ.copy()
        for key in list(env):
            if key.startswith("HDD_DREAMER_") or key == "OPENROUTER_API_KEY":
                env.pop(key, None)
        subprocess.run(
            [sys.executable, str(RUNNER), "--workspace", str(ws), "init", "--seed", "An unknown CLI is installed. Use it."],
            check=True,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        preview = subprocess.run(
            [sys.executable, str(RUNNER), "--workspace", str(ws), "preview-dream", "--check-meta"],
            check=True,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        assert "HDD" not in preview.stdout
        subprocess.run(
            [sys.executable, str(RUNNER), "--workspace", str(ws), "dream"],
            check=True,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        assert (ws / "iterations" / "0001-world.md").exists()
        assert (ws / "outbox" / "0001-dreamer-prompt.md").exists()
        records = [json.loads(line) for line in (ws / "transcript.jsonl").read_text(encoding="utf-8").splitlines()]
        assert records and records[0]["kind"] == "dreamer-prompt"
        assert records[0]["payload"]["mode"] == "diegetic"


def check_trial_workspaces() -> None:
    with tempfile.TemporaryDirectory() as td:
        root = Path(td) / ".hdd"
        env = os.environ.copy()
        for key in list(env):
            if key.startswith("HDD_DREAMER_") or key == "OPENROUTER_API_KEY":
                env.pop(key, None)

        def run(*arguments: str, check: bool = True) -> subprocess.CompletedProcess[str]:
            return subprocess.run(
                [sys.executable, str(RUNNER), "--root", str(root), *arguments],
                check=check,
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
            )

        run("init", "--seed", "Discover the installed interface through use.")
        current = root / "current"
        assert current.is_symlink()
        first_name = os.readlink(current)
        assert first_name != "current"
        first = root / first_name
        assert first.is_dir()
        assert (first / "ledger.json").exists()
        assert not (root / "ledger.json").exists()

        run("init", "--trial", "second-trial", "--seed", "Discover a different interface.")
        second = root / "second-trial"
        assert second.is_dir()
        assert first.is_dir()
        assert os.readlink(current) == "second-trial"

        run("dream")
        assert (second / "outbox" / "0001-dreamer-prompt.md").exists()
        assert not (first / "outbox" / "0001-dreamer-prompt.md").exists()

        run("dream", "--trial", first_name)
        assert (first / "outbox" / "0001-dreamer-prompt.md").exists()
        assert os.readlink(current) == "second-trial"

        invalid = run(
            "init",
            "--trial",
            "../escape",
            "--seed",
            "This must not escape the HDD root.",
            check=False,
        )
        assert invalid.returncode == 2
        assert not (Path(td) / "escape").exists()

        outside = Path(td) / "outside"
        outside.mkdir()
        (root / "linked-trial").symlink_to(outside, target_is_directory=True)
        linked = run("status", "--trial", "linked-trial", check=False)
        assert linked.returncode == 2
        assert "cannot be symlinks" in linked.stderr


def main() -> int:
    check_diegetic_compilation()
    check_reference_migration()
    check_affordance_assessment()
    check_manual_cli()
    check_trial_workspaces()
    print("test_hdd.py: OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

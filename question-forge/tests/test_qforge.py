from __future__ import annotations

from copy import deepcopy
import contextlib
import io
import json
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import qforge  # noqa: E402

EXAMPLE = json.loads((ROOT / "examples/cache-refresh.probeset.json").read_text(encoding="utf-8"))
# A real Jev response to examples/cache-refresh.probeset.json, recorded 2026-09-18.
RECORDED = ROOT / "tests/fixtures/cache-refresh.P001.jev-response.json"


def run(*argv: str) -> tuple[int, str, str]:
    out, err = io.StringIO(), io.StringIO()
    with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
        code = qforge.main(list(argv))
    return code, out.getvalue(), err.getvalue()


def errors_of(ps: dict) -> list[str]:
    return qforge.check_probeset(ps)["errors"]


class CheckTests(unittest.TestCase):
    def setUp(self):
        self.ps = deepcopy(EXAMPLE)

    def test_example_is_clean(self):
        self.assertEqual(errors_of(self.ps), [])

    def test_state_is_built_from_evidence_with_context(self):
        r = qforge.check_probeset(self.ps)
        state = r["states"]["all"]
        self.assertIn("R1", state["requirements"])
        self.assertEqual(state["_context"]["world"]["kind"], "hypothetical")
        self.assertEqual(state["_context"]["itemKinds"]["hypothetical_trace.T3"], "hypothesis")

    def test_shortfall_must_be_declared_and_exact(self):
        del self.ps["shortfall"]
        self.assertTrue(any("shortfall" in e for e in errors_of(self.ps)))
        self.ps["shortfall"] = {"count": 1, "reason": "x"}
        self.assertTrue(any("shortfall.count" in e for e in errors_of(self.ps)))

    def test_reference_outside_information_boundary(self):
        ev = self.ps["evidence"]
        ev["secret_labels.L1"] = {"kind": "source_statement", "path": "secret_labels.L1", "text": "label",
                                 "sourceRef": "x", "worldId": "synthetic", "sensitivity": "public"}
        self.ps["stateViews"]["labels"] = {"worldId": "synthetic", "evidenceRefs": ["secret_labels.L1"]}
        self.ps["probes"][0]["question"]["instructions"] += " `secret_labels.L1`も参照する。"
        errs = errors_of(self.ps)
        self.assertTrue(any("outside its information boundary" in e for e in errs), errs)

    def test_unresolved_path_in_own_view(self):
        self.ps["probes"][0]["question"]["instructions"] += " `requirements.R9`"
        self.assertTrue(any("does not resolve" in e for e in errors_of(self.ps)))

    def test_source_ref_outside_view(self):
        ev = self.ps["evidence"]
        ev["other.X"] = {"kind": "hypothesis", "path": "other.X", "text": "x", "worldId": "synthetic",
                         "sensitivity": "public"}
        self.ps["stateViews"]["other"] = {"worldId": "synthetic", "evidenceRefs": ["other.X"]}
        self.ps["probes"][0]["sourceRefs"].append("other.X")
        self.assertTrue(any("outside its stateView" in e for e in errors_of(self.ps)))

    def test_identical_questions_are_rejected_unless_sensitivity(self):
        dup = deepcopy(self.ps["probes"][0])
        dup["id"] = "Q001b"
        self.ps["probes"].append(dup)
        self.ps["shortfall"]["count"] -= 1
        self.assertTrue(any("identical question" in e for e in errors_of(self.ps)))
        dup["sensitivityOf"] = "Q001"
        self.ps["shortfall"]["count"] += 1
        self.assertEqual(errors_of(self.ps), [])

    def test_near_duplicate_warning_only_for_same_bound_paths(self):
        a = deepcopy(self.ps["probes"][4])  # Q005 asks about `test_descriptions.existing`
        a["id"], a["clusterId"] = "Q005x", "other"
        a["question"]["instructions"] = a["question"]["instructions"].replace("記述しているか", "記述しているか？")
        self.ps["probes"].append(a)
        self.ps["shortfall"]["count"] -= 1
        r = qforge.check_probeset(self.ps)
        self.assertTrue(any("Q005x" in w for w in r["warnings"]))
        a["question"]["instructions"] = a["question"]["instructions"].replace(
            "test_descriptions.existing", "test_descriptions.proposed_cross_node")
        r = qforge.check_probeset(self.ps)
        self.assertFalse(any("Q005x" in w for w in r["warnings"]))

    def test_reference_allocation_scales_with_wave_target(self):
        self.ps["goal"]["execution"] = {"mode": "adaptive-255", "waveTargets": [96, 96, 63]}
        self.ps["shortfall"]["count"] = 84
        info = qforge.check_probeset(self.ps)["info"]["role_groups_vs_reference_allocation"]
        self.assertEqual([v["reference"] for v in info.values()], [36, 24, 18, 12, 6])

    def test_same_wave_data_dependency_is_rejected(self):
        self.ps["probes"][1]["executionDependencies"] = ["Q001"]
        self.assertTrue(any("later wave" in e for e in errors_of(self.ps)))

    def test_credentials_are_rejected_without_echoing_value(self):
        self.ps["evidence"]["requirements.R1"]["text"] += " api_key=abcdef123456"
        errs = errors_of(self.ps)
        self.assertTrue(any("credential-like" in e for e in errs))
        self.assertFalse(any("abcdef123456" in e for e in errs))

    def test_credentials_in_unviewed_evidence_are_rejected(self):
        self.ps["evidence"]["notes.L5"] = {"kind": "source_statement", "path": "notes.L5", "sourceRef": "notes.md#L5",
                                           "text": "postgres://migrator:hunter2secret@db:5432/x",
                                           "worldId": "synthetic", "sensitivity": "public"}
        self.assertTrue(any("credential-like" in e for e in errors_of(self.ps)))

    def test_unsendable_sensitivity(self):
        self.ps["evidence"]["requirements.R1"]["sensitivity"] = "confidential"
        self.assertTrue(any("sendable" in e for e in errors_of(self.ps)))

    def test_excluded_sources_hold_location_only(self):
        self.ps["excludedSources"] = [{"sourceRef": "notes.md#L5", "reason": "credential"}]
        self.assertEqual(errors_of(self.ps), [])
        self.ps["excludedSources"][0]["text"] = "the excluded line"
        self.assertTrue(any("excludedSources[0]" in e for e in errors_of(self.ps)))

    def test_sensitivity_is_required(self):
        del self.ps["evidence"]["requirements.R1"]["sensitivity"]
        self.assertTrue(any("sensitivity is required" in e for e in errors_of(self.ps)))

    def test_extra_question_fields_would_leak(self):
        self.ps["probes"][0]["question"]["outcomeUse"] = {"a": "b"}
        self.assertTrue(any("not part of the API" in e for e in errors_of(self.ps)))

    def test_hypothetical_world_needs_assumptions(self):
        self.ps["worlds"]["synthetic"]["assumptions"] = []
        self.assertTrue(any("assumptions" in e for e in errors_of(self.ps)))

    def test_gate_cycle_is_rejected(self):
        self.ps["probes"][2]["relevanceGates"] = [{"probe": "Q005", "accept": "yes"}]
        self.ps["probes"][4]["relevanceGates"] = [{"probe": "Q003", "accept": "yes"}]
        self.assertTrue(any("gate cycle" in e for e in errors_of(self.ps)))

    def test_gate_accept_must_match_options(self):
        self.ps["probes"][2]["relevanceGates"] = [{"probe": "Q001", "accept": "nope"}]
        self.assertTrue(any("gate accept" in e for e in errors_of(self.ps)))


class PackTests(unittest.TestCase):
    def test_views_never_share_a_packet_and_limits_split(self):
        ps = deepcopy(EXAMPLE)
        ps["stateViews"]["req_only"] = {"worldId": "synthetic",
                                        "evidenceRefs": [e for e in ps["evidence"] if e.startswith("requirements.")]}
        ps["probes"][10]["stateView"] = "req_only"  # Q011 reads only requirements.R1
        r = qforge.check_probeset(ps)
        self.assertEqual(r["errors"], [])
        packets = qforge.pack(r, 0.75, None)
        self.assertEqual(sorted(p["view"] for p in packets), ["all", "req_only"])
        packets = qforge.pack(r, 0.75, 4)
        self.assertTrue(all(len(p["probes"]) <= 4 for p in packets))
        self.assertEqual(sum(len(p["probes"]) for p in packets), 12)

    def test_request_file_path_is_posix_and_bytes_are_lf(self):
        with tempfile.TemporaryDirectory() as d:
            ps_path = Path(d) / "ps.json"
            ps_path.write_text(json.dumps(EXAMPLE, ensure_ascii=False), encoding="utf-8")
            self.assertEqual(run("plan", str(ps_path), "--run", str(Path(d) / "run"))[0], 0)
            plan = json.loads((Path(d) / "run/plan.json").read_text(encoding="utf-8"))
            self.assertEqual(plan["packets"][0]["requestFile"], "packets/P001.request.json")
            self.assertNotIn(b"\r\n", (Path(d) / "run/packets/P001.request.json").read_bytes())

    def test_estimate_is_not_below_recorded_usage(self):
        r = qforge.check_probeset(deepcopy(EXAMPLE))
        est = qforge.pack(r, 0.75, None)[0]["est_tokens"]
        observed = json.loads(RECORDED.read_text(encoding="utf-8"))["usage"]["input_tokens"]
        self.assertGreaterEqual(est, observed)


class AnswerValidationTests(unittest.TestCase):
    profile = qforge.PROVIDER_PROFILES["typesafe-direct"]
    choice_q = {"type": "choice", "instructions": "x", "criteria": {"a": "A", "b": "B"}}
    score_q = {"type": "score", "instructions": "x", "criteria": ["lo", "mid", "hi"]}

    def v(self, q, a):
        return qforge.validate_answer(q, a, self.profile)

    def test_noul_range(self):
        self.assertTrue(self.v({"type": "noul", "instructions": "x"}, {"type": "noul", "noul": 1.2})[0])
        probs, out = self.v({"type": "noul", "instructions": "x"}, {"type": "noul", "noul": 0.3})
        self.assertEqual(probs, [])
        self.assertIsNone(out["providerConfidence"])

    def test_choice_keys_sum_and_argmax(self):
        self.assertTrue(self.v(self.choice_q, {"type": "choice", "choice": "a", "probabilities": {"a": 1.0},
                                               "confidence": 0.9})[0])
        self.assertTrue(self.v(self.choice_q, {"type": "choice", "choice": "a",
                                               "probabilities": {"a": 0.5, "b": 0.3}, "confidence": 0.9})[0])
        self.assertTrue(self.v(self.choice_q, {"type": "choice", "choice": "a",
                                               "probabilities": {"a": 0.3, "b": 0.7}, "confidence": 0.9})[0])
        probs, out = self.v(self.choice_q, {"type": "choice", "choice": "b",
                                            "probabilities": {"a": 0.5, "b": 0.5}, "confidence": 0.1})
        self.assertEqual(probs, [])  # ties are allowed
        self.assertEqual(out["providerConfidence"], 0.1)  # kept separate from max probability
        self.assertEqual(out["derivedMaxProbability"], 0.5)

    def test_score_position(self):
        good = {"type": "score", "score": 1.6, "probabilities": {"0": 0.05, "1": 0.3, "2": 0.65},
                "legend": {"0": "lo", "1": "mid", "2": "hi"}, "confidence": 0.7}
        self.assertEqual(self.v(self.score_q, good)[0], [])
        bad = dict(good, score=0.2)
        self.assertTrue(self.v(self.score_q, bad)[0])

    def test_type_mismatch(self):
        self.assertTrue(self.v(self.choice_q, {"type": "noul", "noul": 0.5})[0])


class RunTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self.tmp.name)
        self.ps_path = self.dir / "ps.json"
        self.run_dir = self.dir / "run"

    def tearDown(self):
        self.tmp.cleanup()

    def plan(self, ps):
        self.ps_path.write_text(json.dumps(ps, ensure_ascii=False), encoding="utf-8")
        code, out, err = run("plan", str(self.ps_path), "--run", str(self.run_dir))
        self.assertEqual(code, 0, out + err)

    def test_send_refusals(self):
        self.plan(deepcopy(EXAMPLE))
        self.assertEqual(run("send", "--run", str(self.run_dir), "--max-requests", "1")[0], 6)
        # The example does not authorize paid execution; the CLI flag cannot widen it.
        self.assertEqual(run("send", "--run", str(self.run_dir), "--authorize-paid", "--max-requests", "1")[0], 6)

    def test_send_requires_inspection_and_budget(self):
        ps = deepcopy(EXAMPLE)
        ps["goal"]["execution"]["paidExecutionAuthorized"] = True
        self.plan(ps)
        self.assertEqual(run("send", "--run", str(self.run_dir), "--authorize-paid", "--max-requests", "1")[0], 4)
        self.assertEqual(run("inspect", "--run", str(self.run_dir))[0], 0)
        req = self.run_dir / "packets/P001.request.json"
        req.write_text(req.read_text(encoding="utf-8").replace("R1", "R1 "), encoding="utf-8")
        self.assertEqual(run("send", "--run", str(self.run_dir), "--authorize-paid", "--max-requests", "1")[0], 4)

    def test_budget_refusal(self):
        ps = deepcopy(EXAMPLE)
        ps["goal"]["execution"]["paidExecutionAuthorized"] = True
        self.plan(ps)
        run("inspect", "--run", str(self.run_dir))
        self.assertEqual(run("send", "--run", str(self.run_dir), "--authorize-paid", "--max-requests", "0")[0], 6)
        code, _, _ = run("send", "--run", str(self.run_dir), "--authorize-paid", "--max-requests", "1",
                         "--max-est-input-tokens", "10")
        self.assertEqual(code, 6)

    def test_plan_refuses_nonempty_run_dir(self):
        self.plan(deepcopy(EXAMPLE))
        code, _, err = run("plan", str(self.ps_path), "--run", str(self.run_dir))
        self.assertEqual(code, 2)

    def test_unsent_packets_are_not_run(self):
        self.plan(deepcopy(EXAMPLE))
        run("normalize", "--run", str(self.run_dir))
        obs = json.loads((self.run_dir / "observations.json").read_text(encoding="utf-8"))["observations"]
        self.assertEqual({o["status"] for o in obs}, {"not_run"})
        self.assertTrue(all(o["value"] is None for o in obs))

    def test_ingest_normalize_report_with_gates_and_errors(self):
        ps = deepcopy(EXAMPLE)
        # Q003 is used only when Q001 says all_api_nodes (recorded answer: yes, p=1.0).
        ps["probes"][2]["relevanceGates"] = [{"probe": "Q001", "accept": "all_api_nodes"}]
        # Q006 is used only when Q005 is yes (recorded answer: 0.05 -> gate false).
        ps["probes"][5]["relevanceGates"] = [{"probe": "Q005", "accept": "yes"}]
        ps["probes"][8]["skip"] = {"status": "not_applicable", "reason": "demo: structurally out of scope"}
        self.plan(ps)
        body = json.loads(RECORDED.read_text(encoding="utf-8"))
        del body["answers"]["Q009"]
        body["answers"]["Q010"]["probabilities"]["unrelated"] = 0.5  # breaks the sum
        body["answers"].pop("Q012")
        body["answers"]["Q012"] = {"type": "noul", "noul": 0.5}  # type mismatch
        resp = self.dir / "resp.json"
        resp.write_text(json.dumps(body), encoding="utf-8")
        code, out, err = run("ingest", "--run", str(self.run_dir), "--packet", "P001", "--response", str(resp),
                             "--origin", "test fixture derived from recorded response")
        self.assertEqual(code, 0, err)
        self.assertEqual(run("normalize", "--run", str(self.run_dir))[0], 0)
        doc = json.loads((self.run_dir / "observations.json").read_text(encoding="utf-8"))
        obs = {o["probeRef"]: o for o in doc["observations"]}
        self.assertEqual(obs["Q003"]["status"], "answered")
        self.assertIn("gate_true:Q001", obs["Q003"]["reasonCodes"])
        self.assertEqual(obs["Q006"]["status"], "not_applicable")
        self.assertIsNotNone(obs["Q006"]["value"])  # raw kept
        self.assertEqual(obs["Q006"]["adoption"], "unused")
        self.assertEqual(obs["Q009"]["status"], "not_applicable")
        self.assertEqual(obs["Q009"]["method"], "deterministic")
        self.assertEqual(obs["Q010"]["status"], "error")
        self.assertEqual(obs["Q012"]["status"], "error")
        self.assertEqual(obs["Q001"]["transport"], "replay")
        self.assertIsNone(obs["Q005"]["providerConfidence"])
        self.assertEqual(run("report", "--run", str(self.run_dir))[0], 0)
        report = (self.run_dir / "report.md").read_text(encoding="utf-8")
        self.assertIn("responses ingested from elsewhere (replay) | 1", report)
        self.assertIn("jev_requests sent over HTTP (incl. retries) | 0", report)
        self.assertIn("not_applicable: 2", report)

    def test_chained_gate_is_order_independent(self):
        ps = deepcopy(EXAMPLE)
        # Q001 (earlier in the list) is gated on Q006, and Q006 is gated off by Q005 (0.05).
        ps["probes"][0]["relevanceGates"] = [{"probe": "Q006", "accept": "yes"}]
        ps["probes"][5]["relevanceGates"] = [{"probe": "Q005", "accept": "yes"}]
        self.plan(ps)
        resp = self.dir / "resp.json"
        resp.write_text(RECORDED.read_text(encoding="utf-8"), encoding="utf-8")
        run("ingest", "--run", str(self.run_dir), "--packet", "P001", "--response", str(resp), "--origin", "test")
        run("normalize", "--run", str(self.run_dir))
        obs = {o["probeRef"]: o for o in json.loads((self.run_dir / "observations.json").read_text(encoding="utf-8"))["observations"]}
        self.assertEqual(obs["Q006"]["status"], "not_applicable")
        self.assertEqual(obs["Q001"]["status"], "abstained")
        self.assertIn("gate_unavailable:Q006", obs["Q001"]["reasonCodes"])

    def test_gate_unresolved_abstains(self):
        ps = deepcopy(EXAMPLE)
        ps["probes"][5]["relevanceGates"] = [{"probe": "Q005", "accept": "yes"}]
        self.plan(ps)
        body = json.loads(RECORDED.read_text(encoding="utf-8"))
        body["answers"]["Q005"]["noul"] = 0.5
        resp = self.dir / "resp.json"
        resp.write_text(json.dumps(body), encoding="utf-8")
        run("ingest", "--run", str(self.run_dir), "--packet", "P001", "--response", str(resp), "--origin", "test")
        run("normalize", "--run", str(self.run_dir))
        obs = {o["probeRef"]: o for o in json.loads((self.run_dir / "observations.json").read_text(encoding="utf-8"))["observations"]}
        self.assertEqual(obs["Q006"]["status"], "abstained")
        self.assertIn("gate_unresolved:Q005", obs["Q006"]["reasonCodes"])
        self.assertEqual(obs["Q005"]["localReading"], "undecided")


if __name__ == "__main__":
    unittest.main()

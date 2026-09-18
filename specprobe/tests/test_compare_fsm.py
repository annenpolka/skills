from __future__ import annotations

from copy import deepcopy
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from compare_fsm import InputError, compare, load_model, validate  # noqa: E402


class FiniteModelTests(unittest.TestCase):
    def setUp(self):
        self.a = json.loads((ROOT / "examples/reset-on-success.json").read_text())
        self.b = json.loads((ROOT / "examples/preserve-on-success.json").read_text())

    def test_shortest_lock_witness(self):
        r = compare(validate(self.a), validate(self.b))
        self.assertEqual(r["status"], "distinguishing_trace")
        self.assertEqual(r["witness"]["events"], ["failure", "failure", "success", "failure"])
        self.assertEqual(r["witness"]["event_count"], 4)
        self.assertTrue(r["witness"]["shortest_for_declared_models"])
        self.assertEqual(r["witness"]["trace"][-1]["left_observation"], {"locked": False})
        self.assertEqual(r["witness"]["trace"][-1]["right_observation"], {"locked": True})
        self.assertEqual(r["source_alignment"], "not_evaluated_by_this_script")

    def test_swapping_sides_retains_length(self):
        r = compare(validate(self.b), validate(self.a))
        self.assertEqual(r["witness"]["event_count"], 4)
        self.assertEqual(r["witness"]["trace"][-1]["left_observation"], {"locked": True})

    def test_identical_models_exhaust_reachable_product(self):
        r = compare(validate(self.a), validate(self.a))
        self.assertEqual(r["status"], "no_observable_difference_in_declared_models")
        self.assertTrue(r["reachable_product_exhausted"])
        self.assertEqual(r["scope"]["pairs_examined"], 4)

    def test_irrelevant_internal_names_do_not_differ(self):
        renamed = deepcopy(self.a)
        renamed["initial"] = "copy_" + renamed["initial"]
        renamed["states"] = {"copy_" + k: {"observation": v["observation"],
            "on": {e: "copy_" + target for e, target in v["on"].items()}}
            for k, v in renamed["states"].items()}
        r = compare(validate(self.a), validate(renamed))
        self.assertTrue(r["reachable_product_exhausted"])

    def test_private_transition_difference_can_be_unobservable(self):
        for model in (self.a, self.b):
            for state in model["states"].values():
                state["observation"]["locked"] = False
        r = compare(validate(self.a), validate(self.b))
        self.assertEqual(r["status"], "no_observable_difference_in_declared_models")

    def test_initial_observation_difference_has_empty_trace(self):
        self.b["states"]["f0"]["observation"]["locked"] = True
        r = compare(validate(self.a), validate(self.b))
        self.assertEqual(r["witness"]["events"], [])
        self.assertEqual(r["witness"]["event_count"], 0)

    def test_boolean_and_number_are_not_coerced(self):
        self.b["states"]["f0"]["observation"]["locked"] = 0
        r = compare(validate(self.a), validate(self.b))
        self.assertEqual(r["witness"]["event_count"], 0)

    def test_event_order_does_not_change_interface(self):
        self.b["events"].reverse()
        self.assertEqual(compare(validate(self.a), validate(self.b))["witness"]["event_count"], 4)

    def test_missing_transition_is_rejected(self):
        del self.a["states"]["f1"]["on"]["success"]
        with self.assertRaisesRegex(InputError, "EVERY event"):
            validate(self.a)

    def test_extra_transition_is_rejected(self):
        self.a["states"]["f1"]["on"]["timeout"] = "f0"
        with self.assertRaises(InputError):
            validate(self.a)

    def test_nondeterministic_transition_is_rejected(self):
        self.a["states"]["f1"]["on"]["success"] = ["f0", "f1"]
        with self.assertRaises(InputError):
            validate(self.a)

    def test_unknown_target_is_rejected(self):
        self.a["states"]["f1"]["on"]["success"] = "missing"
        with self.assertRaises(InputError):
            validate(self.a)

    def test_initial_must_exist(self):
        self.a["initial"] = "missing"
        with self.assertRaises(InputError):
            validate(self.a)

    def test_wrong_observation_shape_is_rejected(self):
        self.a["states"]["f1"]["observation"]["counter"] = 1
        with self.assertRaises(InputError):
            validate(self.a)

    def test_duplicate_events_are_rejected(self):
        self.a["events"].append("failure")
        with self.assertRaises(InputError):
            validate(self.a)

    def test_empty_states_are_rejected(self):
        self.a["states"] = {}
        with self.assertRaises(InputError):
            validate(self.a)

    def test_unknown_format_is_rejected(self):
        self.a["format"] = "invented"
        with self.assertRaises(InputError):
            validate(self.a)

    def test_unknown_root_fields_are_rejected(self):
        self.a["execute"] = "untrusted command"
        with self.assertRaises(InputError):
            validate(self.a)

    def test_different_input_alphabets_are_rejected(self):
        self.b["events"] = ["success"]
        for state in self.b["states"].values():
            del state["on"]["failure"]
        with self.assertRaises(InputError):
            compare(validate(self.a), validate(self.b))

    def test_different_observation_interfaces_are_rejected(self):
        self.b["observation_fields"] = ["other"]
        for state in self.b["states"].values():
            state["observation"] = {"other": False}
        with self.assertRaises(InputError):
            compare(validate(self.a), validate(self.b))

    def test_budget_exhaustion_is_not_equivalence(self):
        r = compare(validate(self.a), validate(self.b), max_pairs=1)
        self.assertEqual(r["status"], "inconclusive")
        self.assertTrue(r["scope"]["truncated"])
        self.assertFalse(r["reachable_product_exhausted"])

    def test_exact_sufficient_budget_does_not_fake_truncation(self):
        r = compare(validate(self.a), validate(self.a), max_pairs=4)
        self.assertFalse(r["scope"]["truncated"])
        self.assertTrue(r["reachable_product_exhausted"])

    def test_invalid_budget_is_rejected(self):
        for value in (0, -1, True, 1.5):
            with self.subTest(value=value), self.assertRaises(InputError):
                compare(validate(self.a), validate(self.b), max_pairs=value)

    def test_duplicate_json_keys_are_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "model.json"
            path.write_text('{"format":"one","format":"two"}')
            with self.assertRaisesRegex(InputError, "Duplicate JSON key"):
                load_model(path)

    def test_non_json_constants_are_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "model.json"
            path.write_text('{"number":NaN}')
            with self.assertRaises(InputError):
                load_model(path)

    def test_file_digest_is_real(self):
        model = load_model(ROOT / "examples/reset-on-success.json")
        self.assertEqual(len(model.digest), 64)
        self.assertEqual(model.name, "reset-on-success")

    def test_unreachable_states_do_not_change_observations(self):
        self.b = deepcopy(self.a)
        self.b["states"]["unreachable"] = {"observation": {"locked": "different"},
            "on": {"failure": "unreachable", "success": "unreachable"}}
        r = compare(validate(self.a), validate(self.b))
        self.assertEqual(r["status"], "no_observable_difference_in_declared_models")

    def test_cli_returns_witness_as_successful_search(self):
        p = subprocess.run([sys.executable, str(ROOT / "scripts/compare_fsm.py"),
            str(ROOT / "examples/reset-on-success.json"),
            str(ROOT / "examples/preserve-on-success.json")], capture_output=True, text=True)
        self.assertEqual(p.returncode, 0, p.stderr)
        self.assertEqual(json.loads(p.stdout)["status"], "distinguishing_trace")

    def test_cli_inconclusive_code(self):
        p = subprocess.run([sys.executable, str(ROOT / "scripts/compare_fsm.py"),
            str(ROOT / "examples/reset-on-success.json"),
            str(ROOT / "examples/preserve-on-success.json"), "--max-pairs", "1"],
            capture_output=True, text=True)
        self.assertEqual(p.returncode, 3)
        self.assertEqual(json.loads(p.stdout)["status"], "inconclusive")

    def test_cli_input_error_does_not_look_like_search(self):
        p = subprocess.run([sys.executable, str(ROOT / "scripts/compare_fsm.py"),
            str(ROOT / "examples/reset-on-success.json"),
            str(ROOT / "examples/preserve-on-success.json"), "--max-pairs", "0"],
            capture_output=True, text=True)
        self.assertEqual(p.returncode, 2)
        self.assertFalse(p.stdout)
        self.assertEqual(json.loads(p.stderr)["status"], "input_error")


if __name__ == "__main__":
    unittest.main()

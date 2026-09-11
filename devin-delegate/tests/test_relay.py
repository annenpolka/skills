import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / 'scripts' / 'relay.py'
spec = importlib.util.spec_from_file_location('relay', SCRIPT)
relay = importlib.util.module_from_spec(spec)
spec.loader.exec_module(relay)

FAKE = '''#!/usr/bin/env python3
import json, os, pathlib, sys, time
args = sys.argv[1:]
pathlib.Path('received.json').write_text(json.dumps({'args':args, 'brief':pathlib.Path(args[args.index('--prompt-file')+1]).read_text(), 'sandbox':os.environ.get('DEVIN_SANDBOX')}))
behavior = os.environ.get('FAKE_BEHAVIOR', 'ok')
if behavior == 'hang':
    time.sleep(30)
if behavior == 'fail':
    sys.exit(7)
if behavior != 'no_export':
    pathlib.Path(args[args.index('--export')+1]).write_text(json.dumps({'session_id':'specific-session','agent':{'model_name':'Test'},'steps':[{'source':'agent','model_name':'test-model','message':'done'}],'final_metrics':{'total_prompt_tokens':12}}))
print('done')
'''

class RelayTest(unittest.TestCase):
    def invoke(self, behavior='ok', extra=()):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            exe = root / 'devin'
            exe.write_text(FAKE)
            exe.chmod(0o700)
            brief = root / 'brief source.txt'
            payload = 'literal $(touch INJECTED) `touch INJECTED`\n日本語'
            brief.write_text(payload)
            env = {**os.environ, 'PATH': str(root)+os.pathsep+os.environ['PATH'],
                   'FAKE_BEHAVIOR': behavior, 'DEVIN_SANDBOX': 'true'}
            p = subprocess.run([sys.executable, str(SCRIPT), '--cd', tmp,
                                '--brief', str(brief), '--model', 'test-model',
                                '--output-root', str(root/'out'), *extra],
                               env=env, capture_output=True, text=True, timeout=8)
            run = Path(p.stdout.splitlines()[0])
            result = json.loads((run/'result.json').read_text())
            received = json.loads((root/'received.json').read_text())
            self.assertEqual(received['brief'], payload)
            self.assertFalse((root/'INJECTED').exists())
            self.assertIsNone(received['sandbox'])
            self.assertEqual(run.stat().st_mode & 0o777, 0o700)
            return p, result, received

    def test_success_is_not_verified_and_resume_is_explicit(self):
        p, r, got = self.invoke(extra=('--session','specific-session'))
        self.assertEqual(p.returncode, 0)
        self.assertEqual(r['status'], 'exited')
        self.assertEqual(r['verification'], 'not_performed')
        self.assertEqual(r['sessionId'], 'specific-session')
        self.assertIsNone(r['cost'])
        self.assertEqual(r['usage']['total_prompt_tokens'], 12)
        self.assertEqual(got['args'][-2:], ['--resume','specific-session'])
        self.assertIn('true', got['args'])

    def test_missing_export_does_not_invent_identity(self):
        _, r, _ = self.invoke('no_export')
        self.assertEqual(r['status'], 'exited')
        self.assertIsNone(r['sessionId'])
        self.assertIsNotNone(r['exportError'])

    def test_nonzero_exit(self):
        p, r, _ = self.invoke('fail')
        self.assertNotEqual(p.returncode, 0)
        self.assertEqual(r['status'], 'failed')
        self.assertEqual(r['exitCode'], 7)

    def test_timeout_stops_process(self):
        p, r, _ = self.invoke('hang', ('--timeout','1.5'))
        self.assertNotEqual(p.returncode, 0)
        self.assertEqual(r['status'], 'timed_out', r)
        with self.assertRaises(ProcessLookupError):
            os.kill(r['pid'], 0)

    def test_sandbox_has_no_bypass_or_smart_fallback(self):
        _, _, got = self.invoke(extra=('--mode','sandbox'))
        self.assertIn('--sandbox', got['args'])
        self.assertIn('autonomous', got['args'])
        self.assertNotIn('dangerous', got['args'])

    def test_malformed_export(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp)/'export.json'
            p.write_text('[]')
            self.assertIsNotNone(relay.inspect_export(p)['exportError'])

if __name__ == '__main__':
    unittest.main()

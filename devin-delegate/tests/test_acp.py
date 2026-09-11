import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

SCRIPT=Path(__file__).resolve().parents[1]/'scripts'/'acp_relay.py'
FAKE='''#!/usr/bin/env python3
import json, sys, os
sid='test-session'
config={'model':'swe-2-max','mode':'accept-edits'}
prompt_id=None
behavior=os.environ.get('TEST_ACP','ok')
def send(x):
 print(json.dumps({'jsonrpc':'2.0',**x}),flush=True)
def update(u):
 send({'method':'session/update','params':{'sessionId':sid,'update':u}})
for line in sys.stdin:
 m=json.loads(line);method=m.get('method');p=m.get('params',{});rid=m.get('id')
 if method=='initialize':send({'id':rid,'result':{'protocolVersion':1,'agentCapabilities':{'loadSession':True}}})
 elif method=='session/new':send({'id':rid,'result':{'sessionId':sid}})
 elif method=='session/load':
  update({'sessionUpdate':'agent_message_chunk','content':{'type':'text','text':'OLD REPLAY'}})
  send({'id':rid,'result':{}})
 elif method=='session/set_config_option':
  config[p['configId']]=p['value']
  send({'id':rid,'result':{'configOptions':[{'id':k,'currentValue':v} for k,v in config.items()]}})
 elif method=='session/prompt':
  prompt_id=rid
  if behavior=='timeout':continue
  if behavior=='permission':
   update({'sessionUpdate':'tool_call','toolCallId':'exec_0','kind':'execute','rawInput':{'command':'echo allowed'},'_meta':{'cognition.ai/inferenceToolName':'exec'}})
   send({'id':'permission-1','method':'session/request_permission','params':{'sessionId':sid,'toolCall':{'toolCallId':'exec_0','_meta':{'cognition.ai/editableCommand':'echo allowed'}},'options':[{'kind':'allow_once','optionId':'once'},{'kind':'allow_always','optionId':'always'}]}})
  else:
   update({'sessionUpdate':'agent_message_chunk','content':{'type':'text','text':'NEW'}})
   send({'id':rid,'result':{'stopReason':'end_turn','usage':{'outputTokens':1}}})
 elif method=='session/cancel':send({'id':prompt_id,'result':{'stopReason':'cancelled'}})
 elif rid=='permission-1':
  if m.get('result',{}).get('outcome',{}).get('optionId')=='once':
   update({'sessionUpdate':'agent_message_chunk','content':{'type':'text','text':'APPROVED'}})
   send({'id':prompt_id,'result':{'stopReason':'end_turn'}})
'''

class ACPTest(unittest.TestCase):
 def invoke(self,behavior='ok',extra=(),allowed=None):
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp);exe=root/'devin';exe.write_text(FAKE);exe.chmod(0o700)
   (root/'brief').write_text('test')
   args=[sys.executable,str(SCRIPT),'--cd',tmp,'--brief',str(root/'brief'),'--output-root',str(root/'out'),*extra]
   if allowed is not None:
    (root/'allowed.json').write_text(json.dumps(allowed));args+=['--allow-commands',str(root/'allowed.json')]
   env={**os.environ,'PATH':tmp+os.pathsep+os.environ['PATH'],'TEST_ACP':behavior}
   proc=subprocess.run(args,env=env,capture_output=True,text=True,timeout=12)
   run=Path(proc.stdout.splitlines()[0]);result=json.loads((run/'result.json').read_text())
   return proc,result
 def test_default_model_and_unverified_completion(self):
  p,r=self.invoke();self.assertEqual(p.returncode,0);self.assertEqual(r['config']['model'],'swe-2-max');self.assertEqual(r['verification'],'not_performed');self.assertIsNone(r['cost'])
 def test_replay_excluded(self):
  _,r=self.invoke(extra=('--session','test-session'));self.assertEqual(r['finalMessage'],'NEW')
 def test_permission_stops_without_grant(self):
  p,r=self.invoke('permission');self.assertNotEqual(p.returncode,0);self.assertEqual(r['status'],'permission_required');self.assertFalse(r['permissions'][0]['granted'])
 def test_exact_once_grant(self):
  _,r=self.invoke('permission',allowed=['echo allowed']);self.assertEqual(r['status'],'turn_completed');self.assertEqual(r['finalMessage'],'APPROVED')
 def test_prefix_does_not_grant(self):
  _,r=self.invoke('permission',allowed=['echo']);self.assertEqual(r['status'],'permission_required')
 def test_timeout_cancels(self):
  _,r=self.invoke('timeout',extra=('--timeout','0.2'));self.assertEqual(r['status'],'timed_out');self.assertEqual(r['stopReason'],'cancelled')

if __name__=='__main__':unittest.main()

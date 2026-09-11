import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

SCRIPT=Path(__file__).resolve().parents[1]/'scripts'/'acp_relay.py'
FAKE='''#!/usr/bin/env python3
import json, sys, os, select
from pathlib import Path
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
 if method=='initialize':
  if behavior=='startup_failure':
   receipt=next(Path(os.environ['TEST_OUTPUT_ROOT']).glob('*/result.json'))
   Path(os.environ['TEST_STARTING_RECEIPT']).write_text(receipt.read_text())
   sys.exit(23)
  send({'id':rid,'result':{'protocolVersion':1,'agentCapabilities':{'loadSession':True}}})
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
  if behavior=='progress':
   # Finite continuous progress: an idle timeout would reach end_turn instead.
   for index in range(200):
    update({'sessionUpdate':'agent_message_chunk','content':{'type':'text','text':'progress '}})
    ready,_,_=select.select([sys.stdin],[],[],0.01)
    if ready:
     request=json.loads(sys.stdin.readline())
     if request.get('method')!='session/cancel':raise RuntimeError('Expected cancellation')
     send({'id':rid,'result':{'stopReason':'cancelled'}})
     break
   else:send({'id':rid,'result':{'stopReason':'end_turn'}})
   continue
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
   env={**os.environ,'PATH':tmp+os.pathsep+os.environ['PATH'],'TEST_ACP':behavior,
        'TEST_OUTPUT_ROOT':str(root/'out'),'TEST_STARTING_RECEIPT':str(root/'starting-result.json')}
   proc=subprocess.run(args,env=env,capture_output=True,text=True,timeout=12)
   run=Path(proc.stdout.splitlines()[0]);result=json.loads((run/'result.json').read_text())
   self.events=[json.loads(line) for line in (run/'events.jsonl').read_text().splitlines()]
   starting=root/'starting-result.json'
   self.starting_result=json.loads(starting.read_text()) if starting.exists() else None
   return proc,result
 def test_default_model_and_unverified_completion(self):
  p,r=self.invoke();self.assertEqual(p.returncode,0);self.assertEqual(r['config']['model'],'swe-2-max');self.assertEqual(r['verification'],'not_performed');self.assertIsNone(r['cost'])
 def test_default_smart_mode_and_requested_settings(self):
  p,r=self.invoke()
  self.assertEqual(p.returncode,0)
  self.assertEqual(r['config']['mode'],'smart')
  self.assertEqual(r.get('requestedModel'),'swe-2-max')
  self.assertEqual(r.get('requestedMode'),'smart')
  self.assertEqual(r.get('promptTimeoutSeconds'),1800)
 def test_explicit_accept_edits_for_new_and_loaded_session(self):
  for session_args in ((),('--session','test-session')):
   with self.subTest(session_args=session_args):
    p,r=self.invoke(extra=('--mode','accept-edits','--timeout','1.25',*session_args))
    self.assertEqual(p.returncode,0)
    self.assertEqual(r['config']['mode'],'accept-edits')
    self.assertEqual(r.get('requestedMode'),'accept-edits')
    self.assertEqual(r.get('promptTimeoutSeconds'),1.25)
    sent=[event['message'] for event in self.events if event['direction']=='send']
    session_method='session/load' if session_args else 'session/new'
    session_request=next(message for message in sent if message.get('method')==session_method)
    if session_args:
     self.assertEqual(session_request['params']['sessionId'],'test-session')
     self.assertFalse(any(message.get('method')=='session/new' for message in sent))
    mode_request=next(message for message in sent if message.get('method')=='session/set_config_option' and message['params']['configId']=='mode')
    self.assertEqual(mode_request['params']['value'],'accept-edits')
    self.assertLess(sent.index(session_request),sent.index(mode_request))
 def test_requested_settings_saved_before_initialize_failure(self):
  cases=[((),'smart',1800),
         (('--mode','accept-edits','--timeout','1.25','--session','test-session'),'accept-edits',1.25)]
  for extra,mode,timeout in cases:
   with self.subTest(mode=mode,timeout=timeout):
    p,r=self.invoke('startup_failure',extra=extra)
    self.assertEqual(p.returncode,1)
    self.assertEqual(r['status'],'failed')
    self.assertIn('ACP closed stdout before the expected response',r['error'])
    self.assertIsNotNone(self.starting_result)
    self.assertEqual(self.starting_result['status'],'starting')
    self.assertFalse(any(event['message'].get('method','').startswith('session/') for event in self.events))
    for receipt in (self.starting_result,r):
     self.assertEqual(receipt.get('requestedModel'),'swe-2-max')
     self.assertEqual(receipt.get('requestedMode'),mode)
     self.assertEqual(receipt.get('promptTimeoutSeconds'),timeout)
 def test_replay_excluded(self):
  _,r=self.invoke(extra=('--session','test-session'));self.assertEqual(r['finalMessage'],'NEW')
 def test_permission_stops_without_grant(self):
  p,r=self.invoke('permission');self.assertNotEqual(p.returncode,0);self.assertEqual(r['status'],'permission_required');self.assertEqual(r['stopReason'],'cancelled');self.assertFalse(r['permissions'][0]['granted'])
 def test_exact_once_grant(self):
  _,r=self.invoke('permission',allowed=['echo allowed']);self.assertEqual(r['status'],'turn_completed');self.assertEqual(r['finalMessage'],'APPROVED')
 def test_prefix_does_not_grant(self):
  _,r=self.invoke('permission',allowed=['echo']);self.assertEqual(r['status'],'permission_required')
 def test_timeout_cancels(self):
  _,r=self.invoke('timeout',extra=('--timeout','0.2'));self.assertEqual(r['status'],'timed_out');self.assertEqual(r['stopReason'],'cancelled')
 def test_progress_does_not_reset_prompt_deadline(self):
  p,r=self.invoke('progress',extra=('--timeout','0.2'))
  self.assertEqual(p.returncode,1)
  self.assertEqual(r['status'],'timed_out')
  self.assertEqual(r['stopReason'],'cancelled')
  received=[event['message'] for event in self.events if event['direction']=='receive']
  chunks=[message for message in received if message.get('method')=='session/update' and message['params']['update']['sessionUpdate']=='agent_message_chunk']
  self.assertGreater(len(chunks),1)
  sent=[event['message'] for event in self.events if event['direction']=='send']
  cancellations=[message for message in sent if message.get('method')=='session/cancel']
  self.assertEqual(len(cancellations),1)
  self.assertEqual(cancellations[0]['params']['sessionId'],'test-session')
  prompt=next(message for message in sent if message.get('method')=='session/prompt')
  response=next(message for message in received if message.get('id')==prompt['id'] and 'result' in message)
  self.assertEqual(response['result']['stopReason'],'cancelled')

if __name__=='__main__':unittest.main()

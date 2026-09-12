import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,realpathSync,mkdirSync,cpSync,writeFileSync,readFileSync,readdirSync,rmSync,existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
const hash=x=>createHash('sha256').update(x).digest('hex');
const source=process.env.PORTABLE_SKILL;
assert.ok(source,'PORTABLE_SKILL must identify the standalone skill folder');
function fx(t){
 const base=realpathSync(mkdtempSync(path.join(tmpdir(),'portable-skill-')));
 t.after(()=>rmSync(base,{recursive:true,force:true}));
 const skill=path.join(base,'installed skill'),root=path.join(base,'unrelated repo');
 cpSync(source,skill,{recursive:true});mkdirSync(root);
 mkdirSync(path.join(root,'src'));mkdirSync(path.join(root,'docs'));
 const text='\ufeffmodule\r\n\treturn "exact";\r\n';writeFileSync(path.join(root,'src/component.txt'),text);
 const helpers={devinHelper:path.join(base,'devin.py'),deepseekHelper:path.join(base,'deepseek.mjs')};
 writeFileSync(helpers.devinHelper,'raise SystemExit("provider must not be called")\n');writeFileSync(helpers.deepseekHelper,'throw Error("provider must not be called");\n');
 const profile={schemaVersion:1,projectName:'Notebook',allowedRoots:['src/','docs/'],...helpers};
 writeFileSync(path.join(root,'profile.json'),JSON.stringify(profile));
 const seed={concept:{id:'routing',title:'Notebook routing',premise:'Unadopted design',scope:['src/']},tasks:[{id:'routing-q1',question:'Can routing reuse this component?',decisionIfTrue:'reuse',decisionIfFalse:'investigate adapter',kind:'constraint',priority:5}]};
 writeFileSync(path.join(root,'seed.json'),JSON.stringify(seed));
 function cli(tool,args){const r=spawnSync(process.execPath,[path.join(skill,'scripts',tool+'.mjs'),...args],{cwd:root,encoding:'utf8',timeout:30000});assert.equal(r.error,undefined,String(r.error));let json;try{json=JSON.parse(r.stdout);}catch{assert.fail(`structured output required: ${r.stdout}\n${r.stderr}`);}return {...r,json};}
 function init(){const r=cli('research',['init','--profile','profile.json']);assert.equal(r.status,0,JSON.stringify(r.json));return r;}
 function state(){const dir=path.join(root,'.runtime/research'),head=JSON.parse(readFileSync(path.join(dir,'HEAD.json')));const bytes=readFileSync(path.join(dir,head.file));assert.equal(hash(bytes),head.sha256);return JSON.parse(bytes);}
 return {base,skill,root,text,profile,seed,cli,init,state};
}
test('copied folder initializes a project, persists queue and retrieves it from another process',t=>{const f=fx(t);f.init();assert.equal(f.cli('research',['add','seed.json']).status,0);assert.equal(f.state().tasks[0].id,'routing-q1');const q=f.cli('research',['query','routing']);assert.equal(q.status,0);assert.ok(q.json.result.tasks.some(x=>x.id==='routing-q1'));assert.equal(f.cli('research',['status']).json.result.queued,1);});
test('profile is explicit, strict and init-only',t=>{const f=fx(t);assert.equal(f.cli('research',['init']).status,1);f.profile.extra=true;writeFileSync(path.join(f.root,'profile.json'),JSON.stringify(f.profile));assert.equal(f.cli('research',['init','--profile','profile.json']).status,1);assert.equal(existsSync(path.join(f.root,'.runtime/research/HEAD.json')),false);});
test('outside-project scope fails without changing committed ledger',t=>{const f=fx(t);f.init();const before=f.state();f.seed.concept.scope=['external/rathena/src/'];writeFileSync(path.join(f.root,'seed.json'),JSON.stringify(f.seed));assert.equal(f.cli('research',['add','seed.json']).status,1);assert.deepEqual(f.state(),before);});
test('changing the external profile does not widen existing ledger scope',t=>{const f=fx(t);f.init();f.profile.allowedRoots.push('outside/');writeFileSync(path.join(f.root,'profile.json'),JSON.stringify(f.profile));f.seed.concept.scope=['outside/'];writeFileSync(path.join(f.root,'seed.json'),JSON.stringify(f.seed));assert.equal(f.cli('research',['add','seed.json']).status,1);assert.equal(f.cli('research',['status','--profile','profile.json']).status,1);});
test('configured file scope does not authorize its parent directory',t=>{const f=fx(t);f.profile.allowedRoots=['src/component.txt'];writeFileSync(path.join(f.root,'profile.json'),JSON.stringify(f.profile));f.init();assert.equal(f.cli('research',['add','seed.json']).status,1);f.seed.concept.scope=['src/component.txt'];writeFileSync(path.join(f.root,'seed.json'),JSON.stringify(f.seed));assert.equal(f.cli('research',['add','seed.json']).status,0);});
test('traversal and protected roots are refused before initialization',t=>{const f=fx(t);for(const root of ['../outside/','.runtime/','src/../docs/','src/credentials/','/tmp/']){f.profile.allowedRoots=[root];writeFileSync(path.join(f.root,'profile.json'),JSON.stringify(f.profile));assert.equal(f.cli('research',['init','--profile','profile.json']).status,1,root);assert.equal(existsSync(path.join(f.root,'.runtime/research/HEAD.json')),false);}});
test('pause prevents provider invocation and duplicate init preserves state',t=>{const f=fx(t);f.init();f.cli('research',['add','seed.json']);assert.equal(f.cli('research',['pause']).status,0);assert.equal(f.cli('research',['tick']).status,0);const before=f.state();assert.equal(f.cli('research',['init','--profile','profile.json']).status,1);assert.deepEqual(f.state(),before);assert.equal(f.cli('research',['resume']).status,0);});
function writing(f){const packet={packetId:'packet',frozenSourceRoot:path.join(f.root,'src'),allowedSourceFiles:[{path:'component.txt',sha256:hash(f.text)}]};const draft={format:'source-ranges-v1',findings:[{statement:'component has a literal return',kind:'source',evidenceRefs:[{path:'component.txt',fromLine:2,toLine:2}],limitations:['static evidence'],decisionImpact:'reuse candidate'}],nextQuestions:[]};for(const [name,value] of [['packet',packet],['draft',draft]])writeFileSync(path.join(f.root,name+'.json'),JSON.stringify(value));return out=>f.cli('research-artifacts',['research','--packet','packet.json','--draft','draft.json','--out',out]);}
test('writer generates exact quotes and receipts from source ranges after relocation',t=>{const f=fx(t);const run=writing(f);const before=readFileSync(path.join(f.root,'src/component.txt'));const r=run('output');assert.equal(r.status,0,JSON.stringify(r.json));const result=JSON.parse(readFileSync(path.join(f.root,'output/result.json')));assert.equal(result.findings[0].evidence[0].quote,'\treturn "exact";\r\n');const receipt=JSON.parse(readFileSync(path.join(f.root,'output/receipt.json')));for(const file of receipt.files){const bytes=readFileSync(path.join(f.root,'output',file.path));assert.equal(hash(bytes),file.sha256);assert.equal(bytes.length,file.bytes);}assert.deepEqual(readFileSync(path.join(f.root,'src/component.txt')),before);assert.equal(run('output').status,1);});
test('changed source cannot produce a completed artifact',t=>{const f=fx(t);const run=writing(f);writeFileSync(path.join(f.root,'src/component.txt'),'changed');assert.equal(run('output').status,1);assert.equal(existsSync(path.join(f.root,'output/receipt.json')),false);});
test('source tree is never an artifact destination',t=>{const f=fx(t);const run=writing(f);assert.equal(run('src/output').status,1);assert.equal(existsSync(path.join(f.root,'src/output')),false);});
test('bundled runtime tampering is rejected instead of rebuilt',t=>{const f=fx(t);f.init();const dir=path.join(f.skill,'scripts/runtime');function files(p){return readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(p,e.name)):[path.join(p,e.name)]);}const compiled=files(dir).filter(x=>/\.(m?js|cjs)$/.test(x));assert.ok(compiled.length>0);for(const p of compiled)writeFileSync(p,readFileSync(p,'utf8')+'\n// tampered\n');assert.equal(f.cli('research',['status']).status,1);});

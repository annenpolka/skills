// One filesystem boundary: return and hash the same bytes without accepting symlink paths.
import path from 'node:path';
import {lstatSync,openSync,readSync,closeSync,fstatSync,constants} from 'node:fs';
import {createHash} from 'node:crypto';
export function readSnapshotRecord(root,relative,maxBytes=33554432){
  if(typeof root!=='string'||!path.isAbsolute(root)||typeof relative!=='string'||
     path.isAbsolute(relative)||relative.split('/').some(p=>!p||p==='.'||p==='..')||relative.includes('\\'))
    throw new Error('invalid snapshot path');
  if(!Number.isSafeInteger(maxBytes)||maxBytes<0)throw new Error('invalid snapshot byte limit');
  const paths=[root];
  for(const part of relative.split('/'))paths.push(path.join(paths.at(-1),part));
  const before=paths.map((p,i)=>{const s=lstatSync(p);
    if(s.isSymbolicLink()||(i===paths.length-1?!s.isFile():!s.isDirectory()))throw new Error('snapshot path is not regular');
    return s;
  });
  if(before.at(-1).size>maxBytes)throw new Error('snapshot file byte limit exceeded');
  const fd=openSync(paths.at(-1),constants.O_RDONLY|constants.O_NOFOLLOW);
  try{
    const opened=fstatSync(fd);
    if(!opened.isFile()||opened.dev!==before.at(-1).dev||opened.ino!==before.at(-1).ino)throw new Error('snapshot file changed before read');
    const chunks=[];let total=0;
    while(total<=maxBytes){
      const chunk=Buffer.allocUnsafe(Math.min(65536,maxBytes+1-total));
      const count=readSync(fd,chunk,0,chunk.length,null);
      if(count===0)break;
      total+=count;
      if(total>maxBytes)throw new Error('snapshot file byte limit exceeded');
      chunks.push(chunk.subarray(0,count));
    }
    const bytes=Buffer.concat(chunks,total);
    const after=paths.map(p=>lstatSync(p));
    for(let i=0;i<after.length;i++)if(after[i].isSymbolicLink()||after[i].dev!==before[i].dev||after[i].ino!==before[i].ino)
      throw new Error('snapshot path changed during read');
    const final=fstatSync(fd);
    if(final.size!==opened.size||final.mtimeMs!==opened.mtimeMs||final.ctimeMs!==opened.ctimeMs||bytes.length!==final.size)
      throw new Error('snapshot file changed during read');
    const text=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes);
    return {text,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};
  }finally{closeSync(fd);}
}

// Read-only signal-zero observation; callers decide whether absence is sufficient.
export function inspectResearchProcess(pid,probe=target=>process.kill(target,0)){
  if(!Number.isInteger(pid)||pid<=0||pid>2147483647)throw new Error('invalid research helper PID');
  const errors=[];
  const observe=target=>{
    try{probe(target);return 'present';}
    catch(error){
      if(error?.code==='ESRCH')return 'absent';
      errors.push({target,code:typeof error?.code==='string'?error.code:'unknown'});
      return 'unknown';
    }
  };
  return {pid,leader:observe(pid),group:observe(-pid),errors};
}

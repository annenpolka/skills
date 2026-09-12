// Preserve and identify the bytes crossing the UTF-8 file boundary.
import {readFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
const identity=bytes=>({sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length});
export function textRecord(text){return identity(Buffer.from(text,'utf8'));}
export function readRecord(file,maxBytes){
  if(maxBytes!==undefined){
    if(!Number.isSafeInteger(maxBytes)||maxBytes<0)throw new Error('invalid record byte limit');
    const info=statSync(file);
    if(!info.isFile()||info.size>maxBytes)throw new Error('record exceeds byte limit or is not a file');
  }
  const bytes=readFileSync(file);
  if(maxBytes!==undefined&&bytes.length>maxBytes)throw new Error('record exceeds byte limit');
  let text;
  try{text=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes);}
  catch(cause){throw Object.assign(new Error('invalid encoded data',{cause}),{code:'EILSEQ'});}
  return {text,...identity(bytes)};
}

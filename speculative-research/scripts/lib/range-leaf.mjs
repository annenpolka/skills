// Exact byte-range IO. Interpretation and eligibility remain with MoonBit.
import {openSync,readSync,closeSync} from 'node:fs';
import {createHash} from 'node:crypto';

const MAX_READ_BYTES=1048576;
function validateRange(offset,bytes){
  if(!Number.isSafeInteger(offset)||offset<0||!Number.isSafeInteger(bytes)||bytes<0||
    !Number.isSafeInteger(offset+bytes)){
    throw Object.assign(new Error('invalid byte range'),{code:'EINVAL'});
  }
}
export function readRange(file,offset,maxBytes){
  validateRange(offset,maxBytes);
  if(maxBytes>MAX_READ_BYTES)throw Object.assign(new Error('invalid range byte limit'),{code:'EINVAL'});
  const fd=openSync(file,'r');
  try{
    const buffer=Buffer.allocUnsafe(maxBytes);
    let count=0;
    while(count<maxBytes){
      const read=readSync(fd,buffer,count,maxBytes-count,offset+count);
      if(read===0)break;
      count+=read;
    }
    const bytes=buffer.subarray(0,count);
    return {bytes:Array.from(bytes),sha256:createHash('sha256').update(bytes).digest('hex')};
  }finally{closeSync(fd);}
}
export function hashRange(file,offset,bytes){
  validateRange(offset,bytes);
  const fd=openSync(file,'r');
  try{
    const hash=createHash('sha256');
    const buffer=Buffer.allocUnsafe(Math.min(bytes,MAX_READ_BYTES));
    let count=0;
    while(count<bytes){
      const read=readSync(fd,buffer,0,Math.min(buffer.length,bytes-count),offset+count);
      if(read===0)throw Object.assign(new Error('byte range ended before requested length'),{code:'EIO'});
      hash.update(buffer.subarray(0,read));
      count+=read;
    }
    return hash.digest('hex');
  }finally{closeSync(fd);}
}

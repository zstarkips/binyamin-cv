import profile from '@/lib/profile';
import { emailPayload, validateContact, validRecipient } from '@/lib/contact';
import { createHash } from 'node:crypto';

export const runtime='nodejs';
export const maxDuration=30;
// Best-effort per-instance throttling, not a distributed rate limiter.
const attempts=new Map<string,{count:number;reset:number}>();
const json=(data:object,status=200)=>Response.json(data,{status});
export async function POST(request:Request){
  const origin=request.headers.get('origin');
  if(!origin||origin!==new URL(request.url).origin)return json({error:'This request is not allowed.'},403);
  if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'Expected a JSON request.'},415);
  const reader=request.body?.getReader();if(!reader)return json({error:'Missing message.'},400);
  let bytes=0;const chunks:Uint8Array[]=[];
  try{while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>16384){await reader.cancel();return json({error:'Your message is too long.'},413);}chunks.push(value);}}catch{return json({error:'Could not read the message.'},400);}
  let raw:unknown;try{raw=JSON.parse(Buffer.concat(chunks).toString());}catch{return json({error:'Invalid message.'},400);}
  const input=validateContact(raw);if(!input)return json({error:'Please enter a valid name, email, and a message of 10–5,000 characters.'},400);
  if(input.website)return json({error:'This message could not be accepted.'},400);
  if(Date.now()-input.startedAt<1500||input.startedAt>Date.now())return json({error:'Please take a moment, then send again.'},429);
  const apiKey=process.env.RESEND_API_KEY,sender=process.env.CONTACT_FROM;
  if(!apiKey||!sender||!validRecipient(profile.email))return json({error:`Email delivery is not configured yet. Please email ${profile.email} directly.`},503);
  const key=createHash('sha256').update(request.headers.get('x-forwarded-for')?.split(',')[0]||'unknown').digest('hex');
  const now=Date.now();for(const [k,v]of attempts)if(v.reset<now)attempts.delete(k);
  const limit=attempts.get(key);if(limit&&limit.count>=5)return json({error:'Too many messages. Please try again in 10 minutes.'},429);
  if(attempts.size>10000)return json({error:'Please try again shortly.'},429);
  attempts.set(key,{count:(limit?.count||0)+1,reset:limit?.reset||now+600000});
  try{
    const idempotency=createHash('sha256').update(JSON.stringify([input.email,input.message,input.startedAt])).digest('hex');
    const result=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json','Idempotency-Key':idempotency},body:JSON.stringify(emailPayload(input,profile.email,sender)),signal:AbortSignal.timeout(15000)});
    if(!result.ok)return json({error:'Your message could not be delivered. Please try again or email me directly.'},502);
    const receipt=await result.json();if(!receipt.id)return json({error:'Delivery could not be confirmed. Please try again.'},502);
    return json({success:true});
  }catch{return json({error:'The email service is temporarily unavailable. Please try again or email me directly.'},502);}
}

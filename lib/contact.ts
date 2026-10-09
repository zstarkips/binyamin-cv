export type ContactInput = {name:string;email:string;message:string;website?:string;startedAt:number};
const emailPattern=/^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/;
export function validateContact(value:unknown):ContactInput|null {
  if(!value||typeof value!=='object')return null;
  const v=value as Record<string,unknown>;
  if(typeof v.name!=='string'||typeof v.email!=='string'||typeof v.message!=='string'||typeof v.startedAt!=='number'||!Number.isFinite(v.startedAt))return null;
  const name=v.name.trim(),email=v.email.trim(),message=v.message.trim();
  if(name.length<2||name.length>100||/[\r\n]/.test(name)||email.length>254||!emailPattern.test(email)||message.length<10||message.length>5000)return null;
  if(v.website!==undefined&&typeof v.website!=='string')return null;
  return {name,email,message,startedAt:v.startedAt,website:typeof v.website==='string'?v.website:''};
}
export function emailPayload(input:ContactInput,recipient:string,sender:string) {
  return {from:sender,to:[recipient],reply_to:input.email,subject:`Portfolio enquiry from ${input.name}`,text:`Name: ${input.name}\nEmail: ${input.email}\n\n${input.message}`};
}
export function validRecipient(email:string){return emailPattern.test(email)&&!email.endsWith('@example.com');}

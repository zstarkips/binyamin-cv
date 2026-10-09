import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import profile from '@/lib/profile';

export async function createProfilePdf(){
  const pdf=await PDFDocument.create();pdf.registerFontkit(fontkit);
  pdf.setTitle(`${profile.name} - Full Professional Profile`);pdf.setAuthor(profile.name);pdf.setSubject(profile.roles.join(' | '));
  const font=await pdf.embedFont(await readFile(path.join(process.cwd(),'public/fonts/poppins-regular.woff')),{subset:true});
  const bold=await pdf.embedFont(await readFile(path.join(process.cwd(),'public/fonts/poppins-semibold.woff')),{subset:true});
  const green=rgb(.27,.55,.29),ink=rgb(.16,.18,.2),muted=rgb(.38,.4,.42);
  const margin=46,width=595.28,height=841.89,available=width-margin*2;
  let page:PDFPage;let y=0;
  function newPage(){page=pdf.addPage([width,height]);y=height-50;page.drawRectangle({x:0,y:height-9,width,height:9,color:green});}
  function ensure(space:number){if(y-space<54)newPage();}
  function wrap(text:string,size:number,f:PDFFont,max=available){const lines:string[]=[];for(const paragraph of text.split('\n')){let line='';for(const word of paragraph.split(/\s+/)){if(!word)continue;const next=line?line+' '+word:word;if(f.widthOfTextAtSize(next,size)<=max){line=next;continue;}if(line)lines.push(line);line='';for(const ch of word){if(f.widthOfTextAtSize(line+ch,size)>max){lines.push(line);line='';}line+=ch;}}lines.push(line);}return lines;}
  function text(value:string,size=10,f=font,color=ink,max=available,x=margin){const lines=wrap(value,size,f,max);for(const line of lines){ensure(size*1.7);page.drawText(line,{x,y:y-size,font:f,size,color});y-=size*1.7;}y-=5;}
  function heading(title:string){ensure(65);y-=15;text(title,16,bold,green);page.drawLine({start:{x:margin,y:y+1},end:{x:width-margin,y:y+1},color:rgb(.86,.89,.86),thickness:.7});y-=12;}
  async function picture(src:string,x:number,top:number,maxW:number,maxH:number){if(!src.startsWith('/images/'))return;const bytes=await readFile(path.join(process.cwd(),'public',src));const img=src.toLowerCase().endsWith('.png')?await pdf.embedPng(bytes):await pdf.embedJpg(bytes);const scaled=img.scale(Math.min(maxW/img.width,maxH/img.height));page.drawImage(img,{x,y:top-scaled.height,width:scaled.width,height:scaled.height});}
  newPage();
  await picture(profile.portrait,width-margin-105,y,105,105);
  text(profile.name,28,bold,ink,available-125);text(profile.roles.join(' | '),10,bold,green,available-125);
  text(`${profile.address}\n${profile.email}\n${profile.phone}`,9,font,muted,available-125);
  y=Math.min(y,height-177);
  heading('Profile');text(profile.biography || profile.description);
  heading('Professional Capabilities');for(const item of profile.services){ensure(70);text(item.name,11,bold);text(item.description);}
  heading('Work Experience');for(const item of profile.experience){ensure(110);text(item.name,12,bold);text(`${item.company} | ${item.date}`,9,bold,green);text(item.description);}
  heading('Education');for(const item of profile.education){ensure(82);text(item.name,11,bold);text(`${item.company} | ${item.date}`,9,bold,green);text(item.description);}
  heading('Skills');for(const [category,items]of Object.entries(profile.skills)){const labels=profile.skillLabels as Record<string,string>;ensure(Math.min(650,40+items.length*25));text(labels[category]||category,11,bold);for(const item of items){if(typeof item==='string')text('• '+item);else text('• '+item.name+('detail' in item&&item.detail?` — ${item.detail}`:''));}}
  if(profile.facts.length){heading('Career Highlights');profile.facts.forEach(f=>text('• '+f.label));}
  if(profile.personalStatement){heading('Personal Statement');text(profile.personalStatement);}
  if(profile.strengths.length){heading('Strengths & Personal Qualities');profile.strengths.forEach(s=>text('• '+s));}
  if(profile.interests.length){heading('Interests & Development Goals');profile.interests.forEach(s=>text('• '+s));}
  if(profile.pricing.length){heading('Pricing');for(const p of profile.pricing){text(`${p.name} — ${p.currency}${p.price} / ${p.unit}`,11,bold);text(p.features.filter(f=>f.included).map(f=>f.label).join(', '));}}
  if(profile.works.length){heading('Selected Work');for(const w of profile.works){ensure(190);await picture(w.image,margin,y,130,100);y-=112;text(`${w.name} | ${w.category}`,11,bold);text(w.description);if(w.url)text(w.url,9,font,green);}}
  if(profile.blog.length){heading('Articles');for(const b of profile.blog){ensure(100);text(b.title,12,bold);text(b.date,9,font,muted);for(const paragraph of b.body)text(paragraph);}}
  if(profile.clients.length){heading('Clients');for(const c of profile.clients){ensure(75);await picture(c.image,margin,y,70,55);y-=60;text(c.name,10,bold);}}
  if(profile.testimonials.length){heading('Testimonials');for(const q of profile.testimonials){text(q.text);text(`${q.name} — ${q.role}`,9,bold,green);}}
  if(profile.quote.text){heading('Professional Statement');text(profile.quote.text);}
  heading('Contact & Social Profiles');text(`${profile.email}\n${profile.phone}\n${profile.address}`);for(const s of profile.socials)text(`${s.name}: ${s.url}`,9,font,green);
  text('References available on request.',9,font,muted);
  const pages=pdf.getPages();pages.forEach((p,i)=>{p.drawLine({start:{x:margin,y:37},end:{x:width-margin,y:37},color:rgb(.86,.89,.86),thickness:.5});p.drawText(profile.name,{x:margin,y:23,font,size:8,color:muted});p.drawText(`${i+1} / ${pages.length}`,{x:width-margin-30,y:23,font,size:8,color:muted});});
  return pdf.save();
}

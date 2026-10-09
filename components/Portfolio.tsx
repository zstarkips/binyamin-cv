'use client';

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import profile from '@/lib/profile';

const tabs = [ ['about','About','ion-person'], ['resume','Resume','ion-android-list'], ['works','Works','ion-paintbrush'], ['blog','Blog','ion-chatbox-working'], ['contacts','Contact','ion-at'] ];
type Work = (typeof profile.works)[number];
type Post = (typeof profile.blog)[number];
type Modal = {kind:'work';work:Work} | {kind:'post';post:Post};
const col = 'col col-d-6 col-t-6 col-m-12 border-line-v';

function Icon({name}:{name:string}) { return <span className={name} aria-hidden="true" />; }
function Title({children}:{children:string}) {const words=children.split(' ');return <h2 className="title">{words.length>1?<><span className="first-word">{words.shift()}</span> {words.join(' ')}</>:<span className="first-letter">{children}</span>}</h2>;}
function Section({title,kind,children}:{title:string;kind:string;children:ReactNode}) {return <section className={`content ${kind}`}><Title>{title}</Title>{children}</section>;}
function Row({children,className=''}:{children:ReactNode;className?:string}) {return <div className={`row ${className}`}>{children}<div className="clear" /></div>;}
function Info({contact=false}:{contact?:boolean}) {const entries=contact?[['Address',profile.address],['Email',profile.email],['Phone',profile.phone],['Freelance',profile.availability]]:profile.aboutFacts.map(f=>[f.label,f.value]);return <div className={`info-list ${contact?'contact-info':''}`}><ul>{entries.map(([label,value])=><li key={label} className={label==='Email'?'email-row':undefined}><strong>{label} . . . . .</strong> {label==='Email'?<a href={`mailto:${value}`}>{value}</a>:label==='Phone'?<a href={`tel:${value.replace(/\s/g,'')}`}>{value}</a>:value}</li>)}</ul></div>;}
function Quote({item}:{item:typeof profile.quote}) {return <div className="revs-item"><div className="text">{item.text}</div><div className="user"><div className="img"><img src={item.image} alt={item.name} /></div><div className="info"><div className="name">{item.name}</div><div className="company">{item.role}</div></div><div className="clear" /></div></div>;}

export default function Portfolio() {
  const [active,setActive]=useState('about');
  const [dark,setDark]=useState(false);
  const [role,setRole]=useState(profile.roles[0]);
  const [menu,setMenu]=useState(false);
  const [query,setQuery]=useState('');
  const [filter,setFilter]=useState('All');
  const [testimonial,setTestimonial]=useState(0);
  const [modal,setModal]=useState<Modal|null>(null);
  const [galleryIndex,setGalleryIndex]=useState(0);
  const [pdfBusy,setPdfBusy]=useState(false);
  const [pdfError,setPdfError]=useState('');
  const modalRef=useRef<HTMLDialogElement>(null);
  const menuRef=useRef<HTMLDialogElement>(null);
  const [formStatus,setFormStatus]=useState({state:'idle',message:''});
  const submittedAt=useRef(Date.now());
  const [message,setMessage]=useState('');
  const panels=useRef<Record<string,HTMLDivElement|null>>({});

  useEffect(()=>{
    setDark(document.documentElement.dataset.theme==='dark');
    const sync=()=>{const hash=location.hash.replace('#','').replace('-card','');if(tabs.some(([id])=>id===hash))setActive(hash);};
    sync();window.addEventListener('hashchange',sync);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return ()=>window.removeEventListener('hashchange',sync);
    let timer:ReturnType<typeof setTimeout>;let n=0;let cursor=profile.roles[0].length;let deleting=true;
    const type=()=>{const word=profile.roles[n];cursor+=deleting?-1:1;setRole(word.slice(0,cursor));let delay=deleting?45:90;if(cursor===0){deleting=false;n=(n+1)%profile.roles.length;delay=200;}else if(cursor===word.length&&!deleting){deleting=true;delay=1800;}timer=setTimeout(type,delay);};
    timer=setTimeout(type,2200);return ()=>{clearTimeout(timer);window.removeEventListener('hashchange',sync);};
  },[]);
  useEffect(()=>{if(modal){modalRef.current?.showModal();setGalleryIndex(0);}else modalRef.current?.close();},[modal]);
  useEffect(()=>{if(menu)menuRef.current?.showModal();else menuRef.current?.close();},[menu]);
  function navigate(id:string) {
    setActive(id);setMenu(false);history.pushState(null,'',`#${id}-card`);
    requestAnimationFrame(()=>{if(innerWidth<=1120)panels.current[id]?.scrollIntoView({behavior:'smooth',block:'start'});else panels.current[id]?.querySelector('.card-wrap')?.scrollTo({top:0});});
  }
  function toggleTheme(){const next=!dark;setDark(next);document.documentElement.dataset.theme=next?'dark':'light';try{localStorage.setItem('portfolio-theme',next?'dark':'light');}catch{}}
  async function downloadCV(){setPdfBusy(true);setPdfError('');try{const response=await fetch('/api/cv');if(!response.ok)throw new Error();const blob=await response.blob();const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`${profile.name.replace(/\s+/g,'-')}-Full-Profile.pdf`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch{setPdfError('The PDF could not be downloaded. Please try again.');}finally{setPdfBusy(false);}}
  async function submitContact(event:FormEvent<HTMLFormElement>){event.preventDefault();if(formStatus.state==='sending')return;const form=event.currentTarget;const data=new FormData(form);setFormStatus({state:'sending',message:''});try{const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:data.get('name'),email:data.get('email'),message:data.get('message'),website:data.get('website'),startedAt:submittedAt.current})});const result=await response.json();if(!response.ok)throw new Error(result.error||'Unable to send your message. Please try again.');setFormStatus({state:'sent',message:'Thank you! Your message has been sent.'});form.reset();setMessage('');submittedAt.current=Date.now();}catch(error){setFormStatus({state:'error',message:error instanceof Error?error.message:'Unable to send your message. Please try again.'});}}
  const visibleWorks=profile.works.filter(w=>filter==='All'||w.category===filter);
  const posts=profile.blog.filter(p=>`${p.title} ${p.excerpt}`.toLowerCase().includes(query.toLowerCase()));
  const currentWork=modal?.kind==='work'?modal.work:null;
  const gallery=currentWork?.gallery.length?currentWork.gallery:currentWork?[currentWork.image]:[];

  return <div className="page">
    <div className="background gradient" aria-hidden="true"><ul className="bg-bubbles">{Array.from({length:10},(_,i)=><li key={i}/>)}</ul></div>
    <a className="skip-link" href="#about-card">Skip to profile content</a>
    <button className="theme-switch" onClick={toggleTheme} aria-label={`Switch to ${dark?'light':'dark'} mode`} title={`Switch to ${dark?'light':'dark'} mode`} aria-pressed={dark}><Icon name="ion-gear-a" /></button>
    <main className="container opened">
      <header className="header">
        <div className="profile"><div className="title">{profile.name}</div><div className="subtitle" aria-label={profile.roles.join(', ')}>{role || '\u00a0'}</div></div>
        <button className="menu-btn" onClick={()=>setMenu(true)} aria-label="Open menu" aria-expanded={menu}><span/></button>
        <nav className="top-menu" aria-label="Profile sections"><ul>{tabs.map(([id,label,icon])=><li className={active===id?'active':''} key={id}><a href={`#${id}-card`} aria-current={active===id?'page':undefined} onClick={e=>{e.preventDefault();navigate(id);}}><Icon name={`icon ${icon}`}/><span className="link">{label}</span></a></li>)}</ul></nav>
      </header>
      <div className="card-started" id="home-card"><div className="profile no-photo">
        <div className="slide" role="img" aria-label={`Portrait of ${profile.name}`} style={{backgroundImage:`url(${profile.portrait})`}}/>
        <h1 className="title">{profile.name}</h1><div className="subtitle" aria-label={profile.roles.join(', ')}>{role || '\u00a0'}</div>
        <div className="social">{profile.socials.map(s=><a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.name}><Icon name={s.icon}/></a>)}</div>
        {pdfError&&<p className="download-error" role="alert">{pdfError}</p>}
        <div className="lnks"><button className="lnk" onClick={downloadCV} disabled={pdfBusy}><span className="text">{pdfBusy?'Preparing PDF…':'Download CV'}</span></button><a href="#contacts-card" className="lnk discover" onClick={e=>{e.preventDefault();navigate('contacts');}}><span className="text">Contact Me</span></a></div>
      </div></div>
      {tabs.map(([id])=><div key={id} id={`${id}-card`} ref={el=>{panels.current[id]=el;}} className={`card-inner ${id==='blog'?'blog ':id==='contacts'?'contacts ':''}${active===id?'active':''}`}><div className="card-wrap">
      {id==='about'&&<>
        <Section title="About Me" kind="about"><Row><div className={col}><p>{profile.description}</p></div><div className={col}><Info/></div></Row></Section>
        <Section title="My Services" kind="services"><Row className="service-items border-line-v">{profile.services.map(s=><div className={col+' border-line-h'} key={s.name}><div className="service-item"><div className="icon"><Icon name={s.icon}/></div><div className="name">{s.name}</div><p>{s.description}</p></div></div>)}</Row></Section>
        {profile.pricing.length>0&&<Section title="Pricing" kind="pricing"><Row className="pricing-items">{profile.pricing.map(p=><div className={col} key={p.name}><div className="pricing-item"><div className="icon"><Icon name={p.icon}/></div><div className="name">{p.name}</div><div className="amount"><span className="dollar">{p.currency}</span><span className="number">{p.price}</span><span className="period">{p.unit}</span></div><div className="feature-list"><ul>{p.features.map(f=><li key={f.label} className={!f.included?'disable':''}>{f.label.replace(' new','')}{f.label.endsWith(' new')&&<> <strong>new</strong></>}</li>)}</ul></div><div className="lnks"><button className="lnk" onClick={()=>{setMessage(`I am interested in your ${p.name} plan.`);navigate('contacts');}}><span className="text">Buy {p.name}</span></button></div></div></div>)}</Row></Section>}
        <Section title="Career Highlights" kind="fuct"><Row className="fuct-items">{profile.facts.map(f=><div key={f.label} className="col col-d-3 col-t-3 col-m-6 border-line-v"><div className="fuct-item"><div className="icon"><Icon name={f.icon}/></div><div className="name">{f.label}</div></div></div>)}</Row></Section>
        {profile.clients.length>0&&<Section title="Clients" kind="clients"><Row className="client-items">{profile.clients.map(c=><div key={c.name} className="col col-d-3 col-t-3 col-m-6 border-line-v"><div className="client-item"><div className="image"><a href={c.url} target="_blank" rel="noopener noreferrer"><img src={c.image} alt={c.name}/></a></div></div></div>)}</Row></Section>}
        <Section title="My Philosophy" kind="quote"><Row><div className="col col-d-12 col-t-12 col-m-12 border-line-v"><Quote item={profile.quote}/></div></Row></Section>
      </>}
      {id==='resume'&&<>
        <Section title="Resume" kind="resume"><Row>{[['Experience','fa fa-briefcase',profile.experience],['Education','fa fa-university',profile.education]].map(([label,icon,items])=><div className={col} key={String(label)}><div className="resume-title border-line-h"><div className="icon"><Icon name={String(icon)}/></div><div className="name">{String(label)}</div></div><div className="resume-items">{(items as typeof profile.experience).map((item,i)=><div className={`resume-item border-line-h ${i===0&&label==='Experience'?'active':''}`} key={item.name}><div className="date">{item.date}</div><div className="name">{item.name}</div><div className="company">{item.company}</div><p>{item.description}</p></div>)}</div></div>)}</Row></Section>
        <Section title="My Skills" kind="skills"><Row>{(['design','languages','coding','knowledge'] as const).map((key,i)=><div key={key} className={col}><div className={`skills-list ${key==='knowledge'?'list':''}`}><div className="skill-title border-line-h"><div className="icon"><Icon name={['fa fa-laptop','fa fa-flag','fa fa-users','fa fa-list'][i]}/></div><div className="name">{profile.skillLabels[key]}</div></div><ul>{key==='knowledge'?profile.skills.knowledge.map(name=><li key={name}><div className="name">{name}</div></li>):profile.skills[key].map(skill=><li className="border-line-h" key={skill.name}><div className="name">{skill.name}</div>{skill.detail&&<div className="skill-detail">{skill.detail}</div>}{skill.level!==null&&<div className="progress" aria-label={`${skill.name}: ${skill.level}%`}><div className="percentage" style={{width:`${skill.level}%`}}/></div>}</li>)}</ul></div></div>)}</Row></Section>
        <Section title="Personal Statement" kind="about"><Row><div className="col col-d-12 col-t-12 col-m-12 border-line-v"><p>{profile.personalStatement}</p></div></Row></Section>
        <Section title="Strengths & Interests" kind="skills"><Row>{[["Strengths",profile.strengths],["Interests",profile.interests]].map(([label,items])=><div className={col} key={String(label)}><div className="skills-list list"><div className="skill-title border-line-h"><div className="name">{String(label)}</div></div><ul>{(items as string[]).map(item=><li key={item}><div className="name">{item}</div></li>)}</ul></div></div>)}</Row></Section>
        {profile.testimonials.length>0&&<Section title="Testimonials" kind="testimonials"><Row><div className="col col-d-12 col-t-12 col-m-12 border-line-v"><div className="revs-carousel"><Quote item={profile.testimonials[testimonial]}/><div className="owl-dots">{profile.testimonials.map((t,i)=><button key={i} className={`owl-dot ${i===testimonial?'active':''}`} aria-label={`Show testimonial ${i+1} from ${t.name}`} aria-pressed={i===testimonial} onClick={()=>setTestimonial(i)}><span/></button>)}</div></div></div></Row></Section>}
      </>}
      {id==='works'&&<Section title="Recent Works" kind="works"><div className="filter-menu filter-button-group" role="group" aria-label="Filter projects">{['All','Image','Gallery','Video','Music','Content'].map(f=><button key={f} className={`f_btn ${filter===f?'active':''}`} aria-pressed={filter===f} onClick={()=>setFilter(f)}>{f}</button>)}</div>{visibleWorks.length===0&&<div className="empty-state"><h3>Selected work, coming soon.</h3><p>I’ll share examples of my professional work here. For enquiries about my experience, please get in touch.</p><button className="button" onClick={()=>navigate('contacts')}>Contact Me <span className="arrow"/></button></div>}<div className="row grid-items portfolio-grid">{visibleWorks.map(w=><div key={w.name} className="col col-d-6 col-t-6 col-m-12 grid-item border-line-h"><div className="box-item"><div className="image"><button onClick={()=>setModal({kind:'work',work:w})} aria-label={`Open ${w.name}`}><img src={w.image} alt={w.name}/><span className="info"><Icon name={`ion-${w.category==='Video'?'videocamera':w.category==='Music'?'music-note':w.category==='Image'?'image':'images'}`}/></span></button></div><div className="desc"><button className="name" onClick={()=>setModal({kind:'work',work:w})}>{w.name}</button><div className="category">{w.category}</div></div></div></div>)}</div></Section>}
      {id==='blog'&&<Section title="Blog" kind="blog"><Row className="border-line-v">{posts.map(p=><div className={col} key={p.id}><div className="box-item"><div className="image"><button onClick={()=>setModal({kind:'post',post:p})} aria-label={`Read ${p.title}`}><img src={p.image} alt={p.title}/><span className="info"><Icon name="ion-document-text"/></span></button></div><div className="desc"><div className="date">{p.date}</div><button className="name" onClick={()=>setModal({kind:'post',post:p})}>{p.title}</button><p>{p.excerpt}</p></div></div></div>)}{posts.length===0&&<p className="empty-state">{query?<>No articles match your search. <button onClick={()=>setQuery('')}>Clear search</button></>:<>Articles and insights will be published here soon.</>}</p>}</Row></Section>}
      {id==='contacts'&&<>
        <Section title="Get in Touch" kind="contacts"><Row><div className="col col-d-12 col-t-12 col-m-12 border-line-v">{profile.mapEmbedUrl?<iframe className="map" src={profile.mapEmbedUrl} title={`Map of ${profile.address}`} loading="lazy" referrerPolicy="no-referrer"/>:<a className="map map-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address)}`} target="_blank" rel="noopener noreferrer" aria-label={`Open map for ${profile.address}`}><Icon name="ion-ios-location-outline"/><span>{profile.address}</span><small>View on Google Maps</small></a>}<Info contact/></div></Row></Section>
        <Section title="Contact Form" kind="contacts"><Row><div className="col col-d-12 col-t-12 col-m-12 border-line-v"><div className="contact_form"><form onSubmit={submitContact}><Row><div className="col col-d-6 col-t-6 col-m-12"><div className="group-val"><input name="name" placeholder="Full Name" aria-label="Full Name" autoComplete="name" required minLength={2} maxLength={100}/></div></div><div className="col col-d-6 col-t-6 col-m-12"><div className="group-val"><input name="email" type="email" placeholder="Email Address" aria-label="Email Address" autoComplete="email" required maxLength={254}/></div></div><div className="col col-d-12 col-t-12 col-m-12"><div className="group-val"><textarea name="message" placeholder="Your Message" aria-label="Your Message" required minLength={10} maxLength={5000} value={message} onChange={e=>setMessage(e.target.value)}/></div></div></Row><div className="honeypot" aria-hidden="true"><label>Website<input name="website" autoComplete="off" tabIndex={-1}/></label></div><div className="align-left"><button className="button" type="submit" disabled={formStatus.state==='sending'}><span className="text">{formStatus.state==='sending'?'Sending…':'Send Message'}</span><span className="arrow"/></button></div><p className={`form-status ${formStatus.state}`} role={formStatus.state==='error'?'alert':'status'}>{formStatus.message}</p></form></div></div></Row></Section>
      </>}
      </div></div>)}
    </main>
    <dialog ref={menuRef} className="portfolio-menu" onCancel={()=>setMenu(false)} onClick={e=>{if(e.target===e.currentTarget)setMenu(false);}}><button className="menu-close" aria-label="Close menu" onClick={()=>setMenu(false)}><Icon name="ion-close"/></button><div className="menu-content"><form onSubmit={e=>{e.preventDefault();navigate('blog');}}><label className="sr-only" htmlFor="search">Search articles</label><div className="menu-search"><input id="search" placeholder="Search …" value={query} onChange={e=>setQuery(e.target.value)}/><button type="submit" aria-label="Search"><Icon name="ion-search"/></button></div></form><Title>Recent Posts</Title><ul>{posts.map(p=><li key={p.id}><button onClick={()=>{setMenu(false);setModal({kind:'post',post:p});}}>{p.title}</button></li>)}</ul><Title>Explore Profile</Title><ul>{tabs.map(([id,label])=><li key={id}><button onClick={()=>navigate(id)}>{label}</button></li>)}</ul><Title>Get in Touch</Title><a href={`mailto:${profile.email}`}>{profile.email}</a></div></dialog>
    <dialog ref={modalRef} className={`project-dialog ${currentWork?.category==='Image'||currentWork?.category==='Gallery'?'image-dialog':''}`} onCancel={()=>setModal(null)} onClick={e=>{if(e.target===e.currentTarget)setModal(null);}} onKeyDown={e=>{if(currentWork?.category==='Gallery'&&['ArrowLeft','ArrowRight'].includes(e.key))setGalleryIndex(i=>(i+(e.key==='ArrowRight'?1:gallery.length-1))%gallery.length);}} aria-label={currentWork?.name||(modal?.kind==='post'?modal.post.title:'Project detail')}>
      <button className="dialog-close" aria-label="Close detail" onClick={()=>setModal(null)}><Icon name="ion-close"/></button>
      {currentWork&&(currentWork.category==='Image'||currentWork.category==='Gallery')?<><img className="lightbox-image" src={gallery[galleryIndex]} alt={`${currentWork.name}${gallery.length>1?` ${galleryIndex+1}`:''}`}/>{gallery.length>1&&<div className="gallery-controls"><button aria-label="Previous image" onClick={()=>setGalleryIndex(i=>(i+gallery.length-1)%gallery.length)}><Icon name="ion-chevron-left"/></button><span>{galleryIndex+1} / {gallery.length}</span><button aria-label="Next image" onClick={()=>setGalleryIndex(i=>(i+1)%gallery.length)}><Icon name="ion-chevron-right"/></button></div>}</>:currentWork?<>{currentWork.category==='Video'?<iframe className="media-frame" title={currentWork.name} src={`https://player.vimeo.com/video/${currentWork.url.split('/').pop()}`} allow="fullscreen; picture-in-picture" allowFullScreen/>:currentWork.category==='Music'?<iframe className="media-frame" title={currentWork.name} src={currentWork.url} allow="autoplay"/>:<img className="project-hero" src={currentWork.image} alt={currentWork.name}/>}<div className="detail-body"><h1>{currentWork.name}</h1><div className="blog-detail">{currentWork.category}</div><p>{currentWork.description}</p>{currentWork.url&&<a href={currentWork.url} target="_blank" rel="noopener noreferrer" className="button">View Project <span className="arrow"/></a>}</div></>:modal?.kind==='post'?<><img className="project-hero" src={modal.post.image} alt={modal.post.title}/><article className="detail-body"><h1>{modal.post.title}</h1><div className="blog-detail">{modal.post.date}</div>{modal.post.body.map((p,i)=><p key={i}>{p}</p>)}</article></>:null}
    </dialog>
  </div>;
}

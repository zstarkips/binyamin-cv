import data from '@/content/profile.json';
export type Work={name:string;category:string;image:string;description:string;url:string;gallery:string[]};
export type Post={id:string;title:string;date:string;image:string;excerpt:string;body:string[]};
export type Testimonial={text:string;name:string;role:string;image:string};
export type Plan={name:string;price:number;currency:string;unit:string;icon:string;features:{label:string;included:boolean}[]};
type Skill={name:string;level:number|null;detail?:string};
type Profile=Omit<typeof data,'pricing'|'clients'|'testimonials'|'works'|'blog'|'skills'> & {
  pricing:Plan[];clients:{name:string;image:string;url:string}[];testimonials:Testimonial[];works:Work[];blog:Post[];
  skills:{design:Skill[];languages:Skill[];coding:Skill[];knowledge:string[]};
};
const profile:Profile=data;
export default profile;

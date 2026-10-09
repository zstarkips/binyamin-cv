import type { Metadata } from 'next';
import profile from '@/lib/profile';
import './globals.css';

export const metadata: Metadata = {
  title: `${profile.name} — ${profile.roles[0]}`,
  description: profile.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><head>
    <script dangerouslySetInnerHTML={{__html: `try{document.documentElement.dataset.theme=localStorage.getItem('portfolio-theme')==='dark'?'dark':'light'}catch{}`}} />
    {['basic','layout','blogs','ionicons','magnific-popup','animate','owl.carousel','gradient','new-skin/new-skin','demos/demo-1-colors'].map(name=><link key={name} rel="stylesheet" href={`/css/${name}.css`} />)}
    <link rel="stylesheet" href="/css/app.css" />
  </head><body>{children}</body></html>;
}

import { createProfilePdf } from '@/lib/profile-pdf';
import profile from '@/lib/profile';
export const runtime='nodejs';
export const maxDuration=30;
export async function GET(){
  try{const pdf=await createProfilePdf();const name=profile.name.replace(/[^a-zA-Z0-9-]/g,'-');return new Response(Buffer.from(pdf),{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="${name}-Full-Profile.pdf"`,'Cache-Control':'public, max-age=0, s-maxage=3600','X-Content-Type-Options':'nosniff'}});}catch(error){console.error('PDF generation failed:',error instanceof Error?error.message:'Unknown error');return Response.json({error:'The PDF could not be generated.'},{status:500});}
}

import {NextResponse} from 'next/server';
import {requireUser} from '@/lib/auth';
import {createAdminClient} from '@/lib/supabase-admin';
export const runtime='nodejs';
export async function GET(req:Request){
  try{
    const user=await requireUser(); const id=new URL(req.url).searchParams.get('id');
    if(!id)return NextResponse.json({error:'id is required'},{status:400});
    const sb=createAdminClient(); const {data,error}=await sb.from('payments').select('id,purpose,payment_method,amount_minor_units,currency,status,paid_at').eq('id',id).eq('user_id',user.id).single();
    if(error)throw error; return NextResponse.json({payment:data});
  }catch(e:any){return NextResponse.json({error:e?.message||'Unable to read payment status'},{status:500});}
}

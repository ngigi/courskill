import {NextResponse} from 'next/server';
import Stripe from 'stripe';
import {createAdminClient} from '@/lib/supabase-admin';

export const runtime = 'nodejs';

function getStripe(){
  const secret=process.env.PAYMENT_PROVIDER_SECRET;
  if(!secret) throw new Error('PAYMENT_PROVIDER_SECRET is not configured.');
  return new Stripe(secret);
}

async function markPaid(paymentId:string, providerReference:string){
  const sb=createAdminClient();
  const {data:p,error:pe}=await sb.from('payments').select('*').eq('id',paymentId).single();
  if(pe) throw pe;
  if(p.status==='paid') return p;
  const {data:u,error:ue}=await sb.from('payments').update({status:'paid',provider:'stripe',provider_reference:providerReference,paid_at:new Date().toISOString(),metadata:{stripe_checkout_session_id:providerReference}}).eq('id',p.id).select('*').single();
  if(ue) throw ue;
  if(p.purpose==='course_enrollment'){
    const {data:c,error:ce}=await sb.from('courses').select('programme_id').eq('id',p.course_id).single();
    if(ce) throw ce;
    const {error:e}=await sb.from('course_enrollments').upsert({user_id:p.user_id,course_id:p.course_id,payment_id:p.id},{onConflict:'user_id,course_id'});
    if(e) throw e;
    const {error:ee}=await sb.from('enrollments').upsert({user_id:p.user_id,programme_id:c.programme_id,status:'active'},{onConflict:'user_id,programme_id'});
    if(ee) throw ee;
  }
  return u;
}

async function markStatus(paymentId:string,status:'failed'|'refunded'|'cancelled',providerReference:string){
  const sb=createAdminClient();
  const {data,error}=await sb.from('payments').update({status,provider:'stripe',provider_reference:providerReference}).eq('id',paymentId).select('*').single();
  if(error) throw error;
  return data;
}

export async function POST(req:Request){
  if(process.env.STRIPE_ENABLED === 'false') return NextResponse.json({error:'Stripe payments are disabled.'},{status:400});
  const secret=process.env.PAYMENT_WEBHOOK_SECRET;
  if(!secret) return NextResponse.json({error:'PAYMENT_WEBHOOK_SECRET is not configured.'},{status:500});
  const signature=req.headers.get('stripe-signature');
  if(!signature) return NextResponse.json({error:'Missing Stripe signature.'},{status:400});
  try{
    const rawBody=await req.text();
    const event=getStripe().webhooks.constructEvent(rawBody,signature,secret);
    if(event.type==='checkout.session.completed' || event.type==='checkout.session.async_payment_succeeded'){
      const session=event.data.object as Stripe.Checkout.Session;
      const paymentId=session.metadata?.paymentId;
      if(paymentId && session.payment_status==='paid') await markPaid(paymentId,session.id);
    } else if(event.type==='checkout.session.async_payment_failed'){
      const session=event.data.object as Stripe.Checkout.Session;
      const paymentId=session.metadata?.paymentId;
      if(paymentId) await markStatus(paymentId,'failed',session.id);
    } else if(event.type==='charge.refunded'){
      const charge=event.data.object as Stripe.Charge;
      const paymentIntentId=typeof charge.payment_intent==='string'?charge.payment_intent:null;
      if(paymentIntentId){
        const sb=createAdminClient();
        const {data:payments}=await sb.from('payments').select('id,metadata').contains('metadata',{stripe_payment_intent_id:paymentIntentId});
        for(const p of payments??[]) await markStatus(p.id,'refunded',paymentIntentId);
      }
    }
    return NextResponse.json({received:true});
  }catch(e:any){
    return NextResponse.json({error:e?.message??'Webhook signature or processing failed'},{status:400});
  }
}

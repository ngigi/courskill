import {NextResponse} from 'next/server';
import Stripe from 'stripe';
import {requireUser} from '@/lib/auth';
import {createAdminClient} from '@/lib/supabase-admin';
import {getPricing, PaymentMethod, PaymentPurpose} from '@/lib/pricing';
import {initiateStkPush} from '@/lib/mpesa';
export const runtime='nodejs';
function getStripe(){const secret=process.env.PAYMENT_PROVIDER_SECRET;if(!secret)throw new Error('PAYMENT_PROVIDER_SECRET is not configured for Stripe.');return new Stripe(secret);}
export async function POST(req:Request){
 try{
  const user=await requireUser(), b=await req.json(); const purpose=b?.purpose as PaymentPurpose, method=b?.paymentMethod as PaymentMethod;
  const courseId=b?.courseId as string|undefined, programmeId=b?.programmeId as string|undefined, phone=b?.phone as string|undefined;
  if(!['course_enrollment','certificate'].includes(purpose))return NextResponse.json({error:'Invalid payment purpose'},{status:400});
  if(!['stripe','mpesa'].includes(method))return NextResponse.json({error:'Choose Stripe card or M-Pesa.'},{status:400});
  if(purpose==='course_enrollment'&&!courseId)return NextResponse.json({error:'courseId is required'},{status:400});
  if(purpose==='certificate'&&!programmeId)return NextResponse.json({error:'programmeId is required'},{status:400});
  if(method==='mpesa'&&!phone)return NextResponse.json({error:'A Kenyan M-Pesa phone number is required.'},{status:400});
  const sb=createAdminClient();
  if(purpose==='course_enrollment'){const {data:e}=await sb.from('course_enrollments').select('id').eq('user_id',user.id).eq('course_id',courseId!).maybeSingle();if(e)return NextResponse.json({error:'Already enrolled in this course'},{status:409});}
  const price=getPricing(method,purpose);
  const {data:payment,error}=await sb.from('payments').insert({user_id:user.id,purpose,payment_method:method,course_id:courseId??null,programme_id:programmeId??null,amount_minor_units:price.amountMinor,currency:price.currency,status:'pending',provider:method,metadata:{checkout_source:'courskills'}}).select('id,purpose,payment_method,amount_minor_units,currency,status').single();
  if(error)throw error;
  if(method==='mpesa'){
   const reference=`CS${payment.id.replace(/-/g,'').slice(0,10)}`;
   try{
    const stk=await initiateStkPush({phone:phone!,amount:price.amountMinor,accountReference:reference,transactionDescription:purpose==='certificate'?'Certificate fee':'Course enrollment'});
    const {error:updateError}=await sb.from('payments').update({provider_reference:stk.CheckoutRequestID,metadata:{checkout_source:'courskills',merchant_request_id:stk.MerchantRequestID,checkout_request_id:stk.CheckoutRequestID,phone:stk.phone}}).eq('id',payment.id);
    if(updateError)throw updateError;
    return NextResponse.json({payment,paymentMethod:'mpesa',checkoutRequestId:stk.CheckoutRequestID,customerMessage:stk.CustomerMessage||'Check your phone for the M-Pesa prompt.'});
   }catch(e){await sb.from('payments').update({status:'failed',metadata:{checkout_source:'courskills',error:String(e)}}).eq('id',payment.id);throw e;}
  }
  const stripe=getStripe(), origin=req.headers.get('origin')||process.env.NEXT_PUBLIC_SITE_URL;if(!origin)throw new Error('NEXT_PUBLIC_SITE_URL is required when Origin is unavailable.');
  const label=purpose==='certificate'?'Courskills certificate':'Courskills course enrollment';
  const session=await stripe.checkout.sessions.create({mode:'payment',line_items:[{price_data:{currency:'usd',product_data:{name:label,description:'Courskills fixed fee — no other LMS charges.'},unit_amount:price.amountMinor},quantity:1}],metadata:{paymentId:payment.id,purpose,courseId:courseId??'',programmeId:programmeId??'',userId:user.id},success_url:`${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,cancel_url:`${origin}/checkout?purpose=${encodeURIComponent(purpose)}${courseId?`&courseId=${encodeURIComponent(courseId)}`:''}${programmeId?`&programmeId=${encodeURIComponent(programmeId)}`:''}`});
  await sb.from('payments').update({provider_reference:session.id,metadata:{stripe_checkout_session_id:session.id}}).eq('id',payment.id); return NextResponse.json({payment,paymentMethod:'stripe',checkoutUrl:session.url});
 }catch(e:any){return NextResponse.json({error:e?.message??'Unable to create payment'},{status:500});}
}

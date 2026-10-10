import {NextResponse} from 'next/server';
import {createAdminClient} from '@/lib/supabase-admin';

export const runtime = 'nodejs';

async function markPaid(paymentId:string, providerReference:string, metadata:any){
  const sb=createAdminClient();
  const {data:p,error:pe}=await sb.from('payments').select('*').eq('id',paymentId).single();
  if(pe) throw pe;
  if(p.status==='paid') return;
  const {data:c,error:ce}=await sb.from('courses').select('programme_id').eq('id',p.course_id).maybeSingle();
  if(p.purpose==='course_enrollment' && ce) throw ce;
  if(p.purpose==='course_enrollment' && !c) throw new Error('Course programme could not be found.');
  if(p.payment_method!=='mpesa' || p.currency!=='KES' || p.amount_minor_units!==1200) throw new Error('Payment amount/currency validation failed.');
  await sb.from('payments').update({status:'paid',provider:'mpesa',provider_reference:providerReference,paid_at:new Date().toISOString(),metadata:{...(p.metadata||{}),...metadata}}).eq('id',p.id);
  if(p.purpose==='course_enrollment'){
    const {error:e}=await sb.from('course_enrollments').upsert({user_id:p.user_id,course_id:p.course_id,payment_id:p.id},{onConflict:'user_id,course_id'});
    if(e) throw e;
    const {error:ee}=await sb.from('enrollments').upsert({user_id:p.user_id,programme_id:c!.programme_id,status:'active'},{onConflict:'user_id,programme_id'});
    if(ee) throw ee;
  }
}

export async function POST(req:Request){
  try{
    const body=await req.json();
    const callback=body?.Body?.stkCallback;
    const checkoutRequestId=callback?.CheckoutRequestID as string|undefined;
    if(!checkoutRequestId) return NextResponse.json({ResultCode:0,ResultDesc:'Accepted'});
    const sb=createAdminClient();
    const {data:p,error}=await sb.from('payments').select('*').eq('provider','mpesa').eq('provider_reference',checkoutRequestId).single();
    if(error || !p) return NextResponse.json({ResultCode:0,ResultDesc:'Accepted'});
    const resultCode=Number(callback?.ResultCode);
    if(resultCode!==0){
      await sb.from('payments').update({status:'failed',metadata:{...(p.metadata||{}),mpesa_result_code:resultCode,mpesa_result_desc:callback?.ResultDesc||''}}).eq('id',p.id);
      return NextResponse.json({ResultCode:0,ResultDesc:'Accepted'});
    }
    const items=callback?.CallbackMetadata?.Item || [];
    const meta:any={};
    for(const item of items){ if(item?.Name) meta[String(item.Name).replace(/\s+/g,'_').toLowerCase()]=item.Value; }
    if(Number(meta.amount)!==1200) throw new Error('Unexpected M-Pesa amount.');
    await markPaid(p.id,String(meta.mpesareceiptnumber||checkoutRequestId),{mpesa_result_code:resultCode,mpesa_receipt_number:meta.mpesareceiptnumber,mpesa_transaction_date:meta.transactiondate,mpesa_phone_number:meta.phonenumber});
    return NextResponse.json({ResultCode:0,ResultDesc:'Accepted'});
  }catch(e:any){
    return NextResponse.json({ResultCode:1,ResultDesc:e?.message||'Callback processing failed'},{status:500});
  }
}

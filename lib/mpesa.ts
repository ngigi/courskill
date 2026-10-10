export type MpesaEnvironment = 'sandbox' | 'production';
function config(){
  const environment=(process.env.MPESA_ENV||'sandbox') as MpesaEnvironment;
  const consumerKey=process.env.MPESA_CONSUMER_KEY, consumerSecret=process.env.MPESA_CONSUMER_SECRET;
  const shortCode=process.env.MPESA_SHORTCODE, passKey=process.env.MPESA_PASSKEY, callbackUrl=process.env.MPESA_CALLBACK_URL;
  if(!consumerKey||!consumerSecret||!shortCode||!passKey||!callbackUrl) throw new Error('M-Pesa credentials are not fully configured.');
  return {baseUrl:environment==='production'?'https://api.safaricom.co.ke':'https://sandbox.safaricom.co.ke',consumerKey,consumerSecret,shortCode,passKey,callbackUrl};
}
function timestampNairobi(){
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Nairobi',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
  const p=Object.fromEntries(parts.map(x=>[x.type,x.value])); return `${p.year}${p.month}${p.day}${p.hour}${p.minute}${p.second}`;
}
export function normalizeKenyanPhone(input:string){
  const raw=input.trim().replace(/[\s-]/g,''); const digits=raw.replace(/\D/g,'');
  if(/^07\d{8}$/.test(digits)||/^01\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
  if(/^254[17]\d{8}$/.test(digits)) return digits;
  throw new Error('Enter a valid Kenyan mobile number, e.g. 0712345678.');
}
async function accessToken(){
  const c=config(); const basic=Buffer.from(`${c.consumerKey}:${c.consumerSecret}`).toString('base64');
  const response=await fetch(`${c.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,{headers:{Authorization:`Basic ${basic}`},cache:'no-store'});
  const data=await response.json(); if(!response.ok||!data.access_token) throw new Error(data.error_description||'Unable to authenticate with M-Pesa.'); return data.access_token as string;
}
export async function initiateStkPush(args:{phone:string;amount:number;accountReference:string;transactionDescription:string}){
  const c=config(), token=await accessToken(), timestamp=timestampNairobi(), password=Buffer.from(`${c.shortCode}${c.passKey}${timestamp}`).toString('base64'), phone=normalizeKenyanPhone(args.phone);
  const payload={BusinessShortCode:c.shortCode,Password:password,Timestamp:timestamp,TransactionType:process.env.MPESA_TRANSACTION_TYPE||'CustomerPayBillOnline',Amount:Math.round(args.amount),PartyA:phone,PartyB:c.shortCode,PhoneNumber:phone,CallBackURL:c.callbackUrl,AccountReference:args.accountReference.slice(0,12),TransactionDesc:args.transactionDescription.slice(0,13)};
  const response=await fetch(`${c.baseUrl}/mpesa/stkpush/v1/processrequest`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(payload),cache:'no-store'});
  const data=await response.json(); if(!response.ok||data.ResponseCode!=='0') throw new Error(data.errorMessage||data.ResponseDescription||'M-Pesa STK Push was rejected.'); return {...data,phone};
}

'use client';
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';

export default function CheckoutSuccess(){
  const params=useSearchParams();
  const sessionId=params.get('session_id');
  return <main className="section"><div className="container" style={{maxWidth:720}}><div className="card"><div className="eyebrow" style={{color:'var(--brand)'}}>Courskills payment</div><h1>Payment submitted</h1><p className="muted">Stripe has returned you to Courskills. Your enrollment or certificate is activated after the verified Stripe webhook is received.</p>{sessionId&&<p className="muted" style={{fontSize:13,wordBreak:'break-all'}}>Stripe session: {sessionId}</p>}<div style={{display:'flex',gap:12,marginTop:20}}><Link className="btn" href="/dashboard">Go to dashboard</Link><Link className="btn secondary" href="/programmes">Browse programmes</Link></div></div></div></main>
}

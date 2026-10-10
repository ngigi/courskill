import {NextRequest,NextResponse} from 'next/server';import {marketProvider} from '@/lib/market';
export async function GET(req:NextRequest){const symbol=req.nextUrl.searchParams.get('symbol')||'EURUSD';const q=await marketProvider().quote(symbol);return NextResponse.json(q,{headers:{'Cache-Control':'no-store'}})}

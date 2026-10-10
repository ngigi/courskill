import {NextResponse} from 'next/server';
import {requireUser} from '@/lib/auth';
import {createAdminClient} from '@/lib/supabase-admin';
import {assessmentSchema} from '@/lib/validation';

export async function GET(req:Request){
 try{await requireUser();const url=new URL(req.url);const id=url.searchParams.get('id');if(!id)return NextResponse.json({error:'assessment id required'},{status:400});const db=createAdminClient();const {data,error}=await db.from('assessments').select('id,title,pass_percent,assessment_questions(id,prompt,options,points)').eq('id',id).single();if(error)throw error;return NextResponse.json({assessment:data});}
 catch(e:any){return NextResponse.json({error:e.message},{status:e.message==='UNAUTHENTICATED'?401:400})}
}

export async function POST(req:Request){
 try{const user=await requireUser();const body=assessmentSchema.parse(await req.json());const db=createAdminClient();const {data:assessment,error}=await db.from('assessments').select('id,pass_percent,assessment_questions(id,correct_option,points)').eq('id',body.assessmentId).single();if(error||!assessment)throw error||new Error('Assessment not found');let earned=0,total=0;for(const q of assessment.assessment_questions as any[]){total+=q.points;const selected=body.answers[q.id];if(selected===q.correct_option)earned+=q.points}const score=total?Math.round(earned/total*100):0;const passed=score>=(assessment.pass_percent??80);const {error:saveError}=await db.from('assessment_attempts').insert({assessment_id:assessment.id,user_id:user.id,answers:body.answers,score_percent:score,passed});if(saveError)throw saveError;return NextResponse.json({score,passed});}
 catch(e:any){return NextResponse.json({error:e.message},{status:e.message==='UNAUTHENTICATED'?401:400})}
}

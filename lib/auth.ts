import {createServerSupabase} from './supabase';
export async function getUser(){const supabase=await createServerSupabase();const {data}=await supabase.auth.getUser();return data.user}
export async function requireUser(){const user=await getUser();if(!user)throw new Error('UNAUTHENTICATED');return user}

import {z} from 'zod';
export const progressSchema=z.object({lessonId:z.string().uuid(),completed:z.boolean()});
export const assessmentSchema=z.object({assessmentId:z.string().uuid(),answers:z.record(z.string(),z.number().int().nonnegative())});
export const journalSchema=z.object({pair:z.string().min(3).max(20),setup:z.string().min(2).max(100),risk:z.number().positive().max(100000),outcome:z.string().max(30),reason:z.string().min(5).max(2000)});

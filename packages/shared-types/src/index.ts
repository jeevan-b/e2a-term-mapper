import { z } from 'zod';

export interface EnglishTerm { id: string; term: string; slug: string }
export interface AssameseTerm { id: string; term: string; slug: string }
export interface TermMapping { id: string; english_id: string; assamese_id: string }
export interface User { id: string; email: string; password_hash: string; role: 'admin'; created_at: string; last_login_at?: string | null }
export interface TermsData { version: string; last_updated: string; english_terms: EnglishTerm[]; assamese_terms: AssameseTerm[]; mappings: TermMapping[]; users: User[] }

export const englishTermSchema = z.object({ id: z.string().min(1), term: z.string().min(1), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) });
export const assameseTermSchema = z.object({ id: z.string().min(1), term: z.string().min(1), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) });
export const termMappingSchema = z.object({ id: z.string().min(1), english_id: z.string().min(1), assamese_id: z.string().min(1) });
export const userSchema = z.object({ id: z.string().min(1), email: z.string().email(), password_hash: z.string().min(20), role: z.literal('admin'), created_at: z.string().datetime(), last_login_at: z.string().datetime().nullable().optional() });
export const termsDataSchema = z.object({ version: z.string().min(1), last_updated: z.string().datetime(), english_terms: z.array(englishTermSchema), assamese_terms: z.array(assameseTermSchema), mappings: z.array(termMappingSchema), users: z.array(userSchema).default([]) }).superRefine((data, ctx) => {
  const englishIds = new Set(data.english_terms.map((term) => term.id));
  const assameseIds = new Set(data.assamese_terms.map((term) => term.id));
  const mappingPairs = new Set<string>();
  for (const mapping of data.mappings) {
    if (!englishIds.has(mapping.english_id)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Unknown english_id ${mapping.english_id}`, path: ['mappings'] });
    if (!assameseIds.has(mapping.assamese_id)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Unknown assamese_id ${mapping.assamese_id}`, path: ['mappings'] });
    const pair = `${mapping.english_id}:${mapping.assamese_id}`;
    if (mappingPairs.has(pair)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Duplicate mapping ${pair}`, path: ['mappings'] });
    mappingPairs.add(pair);
  }
});

export type EnglishTermInput = z.infer<typeof englishTermSchema>;
export type AssameseTermInput = z.infer<typeof assameseTermSchema>;
export type TermMappingInput = z.infer<typeof termMappingSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type TermsDataInput = z.infer<typeof termsDataSchema>;

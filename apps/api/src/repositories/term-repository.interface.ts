import type { AssameseTerm, EnglishTerm, TermMapping, User } from '@term-mapper/shared-types';
export interface TermWithEquivalents<T, E> { term: T; equivalents: E[] }
export interface Page<T> { items: T[]; page: number; limit: number; total: number }
export interface ITermRepository {
  search(q: string, options?: { lang?: 'en'|'as'|'all'; mode?: 'exact'|'fuzzy'; limit?: number }): Promise<{ english: EnglishTerm[]; assamese: AssameseTerm[] }>;
  getEnglishTermBySlug(slug: string): Promise<TermWithEquivalents<EnglishTerm, AssameseTerm> | null>;
  getAssameseTermBySlug(slug: string): Promise<TermWithEquivalents<AssameseTerm, EnglishTerm> | null>;
  browseEnglish(letter?: string, page?: number, limit?: number): Promise<Page<EnglishTerm>>;
  browseAssamese(letter?: string, page?: number, limit?: number): Promise<Page<AssameseTerm>>;
  listEnglish(q?: string, page?: number, limit?: number): Promise<Page<EnglishTerm>>;
  listAssamese(q?: string, page?: number, limit?: number): Promise<Page<AssameseTerm>>;
  listMappings(q?: string, page?: number, limit?: number): Promise<Page<TermMapping>>;
  getStats(): Promise<{ english_terms: number; assamese_terms: number; mappings: number }>;
  findUserByEmail(email: string): Promise<User | null>;
  createEnglishTerm(input: Omit<EnglishTerm, 'id'>): Promise<EnglishTerm>; updateEnglishTerm(id: string, input: Partial<Omit<EnglishTerm,'id'>>): Promise<EnglishTerm>; deleteEnglishTerm(id: string, force?: boolean): Promise<void>;
  createAssameseTerm(input: Omit<AssameseTerm, 'id'>): Promise<AssameseTerm>; updateAssameseTerm(id: string, input: Partial<Omit<AssameseTerm,'id'>>): Promise<AssameseTerm>; deleteAssameseTerm(id: string, force?: boolean): Promise<void>;
  createMapping(input: Omit<TermMapping, 'id'>): Promise<TermMapping>; deleteMapping(id: string): Promise<void>;
}

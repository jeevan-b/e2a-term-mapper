import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { termsDataSchema, type AssameseTerm, type EnglishTerm, type TermMapping, type TermsData, type User } from '@term-mapper/shared-types';
import { ConflictError, NotFoundError } from '../errors/http-errors.js';
import type { ITermRepository, Page, TermWithEquivalents } from './term-repository.interface.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const collator = new Intl.Collator('as');
const page = <T>(items: T[], p = 1, l = 20): Page<T> => ({ items: items.slice((p - 1) * l, p * l), page: p, limit: l, total: items.length });
const slugify = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const nextId = (prefix: string, existing: { id: string }[]) => `${prefix}${String(existing.length + 1).padStart(3, '0')}`;

export class JsonTermRepository implements ITermRepository {
  private data!: TermsData;
  private constructor(private readonly filePath: string) {}
  static async create(path: string) { const repo = new JsonTermRepository(resolve(process.cwd(), path)); await repo.load(); return repo; }
  private async load() { this.data = termsDataSchema.parse(JSON.parse(await readFile(this.filePath, 'utf8'))); }
  private async persist() { this.data.last_updated = new Date().toISOString(); await writeFile(this.filePath, JSON.stringify(this.data, null, 2) + '\n'); }
  async search(q: string, options = {}) { const query = q.trim().toLocaleLowerCase(); const match = (t: string) => options.mode === 'exact' ? t.toLocaleLowerCase() === query : t.toLocaleLowerCase().includes(query); const limit = options.limit ?? 20; return { english: options.lang === 'as' ? [] : this.data.english_terms.filter((t) => match(t.term)).slice(0, limit), assamese: options.lang === 'en' ? [] : this.data.assamese_terms.filter((t) => match(t.term)).slice(0, limit) }; }
  async getEnglishTermBySlug(slug: string): Promise<TermWithEquivalents<EnglishTerm, AssameseTerm> | null> { const term = this.data.english_terms.find((t) => t.slug === slug); if (!term) return null; const ids = this.data.mappings.filter((m) => m.english_id === term.id).map((m) => m.assamese_id); return { term, equivalents: this.data.assamese_terms.filter((t) => ids.includes(t.id)) }; }
  async getAssameseTermBySlug(slug: string): Promise<TermWithEquivalents<AssameseTerm, EnglishTerm> | null> { const term = this.data.assamese_terms.find((t) => t.slug === slug); if (!term) return null; const ids = this.data.mappings.filter((m) => m.assamese_id === term.id).map((m) => m.english_id); return { term, equivalents: this.data.english_terms.filter((t) => ids.includes(t.id)) }; }
  async browseEnglish(letter?: string, p = 1, l = 20) { return page(this.data.english_terms.filter((t) => !letter || t.slug.startsWith(letter.toLowerCase())).sort((a,b) => a.term.localeCompare(b.term)), p, l); }
  async browseAssamese(letter?: string, p = 1, l = 20) { return page(this.data.assamese_terms.filter((t) => !letter || t.term.startsWith(letter)).sort((a,b) => collator.compare(a.term,b.term)), p, l); }
  async listEnglish(q = '', p = 1, l = 20) { return page(this.data.english_terms.filter((t) => t.term.toLowerCase().includes(q.toLowerCase())), p, l); }
  async listAssamese(q = '', p = 1, l = 20) { return page(this.data.assamese_terms.filter((t) => t.term.includes(q)), p, l); }
  async listMappings(q = '', p = 1, l = 20) { return page(this.data.mappings.filter((m) => JSON.stringify(m).includes(q)), p, l); }
  async getStats() { return { english_terms: this.data.english_terms.length, assamese_terms: this.data.assamese_terms.length, mappings: this.data.mappings.length }; }
  async findUserByEmail(email: string): Promise<User | null> { return this.data.users.find((u) => u.email === email) ?? null; }
  async createEnglishTerm(input: Omit<EnglishTerm,'id'>) { if (this.data.english_terms.some((t) => t.term === input.term || t.slug === input.slug)) throw new ConflictError('English term already exists'); const term = { id: nextId('e', this.data.english_terms), term: input.term, slug: input.slug || slugify(input.term) }; this.data.english_terms.push(term); await this.persist(); return term; }
  async updateEnglishTerm(id: string, input: Partial<Omit<EnglishTerm,'id'>>) { const term = this.data.english_terms.find((t) => t.id === id); if (!term) throw new NotFoundError('English term not found'); Object.assign(term, input); await this.persist(); return term; }
  async deleteEnglishTerm(id: string, force = false) { const has = this.data.mappings.some((m) => m.english_id === id); if (has && !force) throw new ConflictError('English term has active mappings'); this.data.english_terms = this.data.english_terms.filter((t) => t.id !== id); this.data.mappings = this.data.mappings.filter((m) => m.english_id !== id); await this.persist(); }
  async createAssameseTerm(input: Omit<AssameseTerm,'id'>) { if (this.data.assamese_terms.some((t) => t.term === input.term || t.slug === input.slug)) throw new ConflictError('Assamese term already exists'); const term = { id: nextId('a', this.data.assamese_terms), term: input.term, slug: input.slug }; this.data.assamese_terms.push(term); await this.persist(); return term; }
  async updateAssameseTerm(id: string, input: Partial<Omit<AssameseTerm,'id'>>) { const term = this.data.assamese_terms.find((t) => t.id === id); if (!term) throw new NotFoundError('Assamese term not found'); Object.assign(term, input); await this.persist(); return term; }
  async deleteAssameseTerm(id: string, force = false) { const has = this.data.mappings.some((m) => m.assamese_id === id); if (has && !force) throw new ConflictError('Assamese term has active mappings'); this.data.assamese_terms = this.data.assamese_terms.filter((t) => t.id !== id); this.data.mappings = this.data.mappings.filter((m) => m.assamese_id !== id); await this.persist(); }
  async createMapping(input: Omit<TermMapping,'id'>) { if (this.data.mappings.some((m) => m.english_id === input.english_id && m.assamese_id === input.assamese_id)) throw new ConflictError('Mapping already exists'); const mapping = { id: nextId('m', this.data.mappings), ...input }; this.data.mappings.push(mapping); await this.persist(); return mapping; }
  async deleteMapping(id: string) { const before = this.data.mappings.length; this.data.mappings = this.data.mappings.filter((m) => m.id !== id); if (before === this.data.mappings.length) throw new NotFoundError('Mapping not found'); await this.persist(); }
}

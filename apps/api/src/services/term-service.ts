import { NotFoundError } from '../errors/http-errors.js';
import type { ITermRepository } from '../repositories/term-repository.interface.js';
export class TermService { constructor(private readonly repo: ITermRepository) {}
  search(q: string, options?: { lang?: 'en'|'as'|'all'; mode?: 'exact'|'fuzzy'; limit?: number }) { return this.repo.search(q, options).then((r) => ({ english_matches: r.english, assamese_matches: r.assamese })); }
  async getEnglishTerm(slug: string) { const term = await this.repo.getEnglishTermBySlug(slug); if (!term) throw new NotFoundError('English term not found'); return term; }
  async getAssameseTerm(slug: string) { const term = await this.repo.getAssameseTermBySlug(slug); if (!term) throw new NotFoundError('Assamese term not found'); return term; }
  browseEnglish(letter?: string, page?: number, limit?: number) { return this.repo.browseEnglish(letter, page, limit); }
  browseAssamese(letter?: string, page?: number, limit?: number) { return this.repo.browseAssamese(letter, page, limit); }
  getStats() { return this.repo.getStats(); }
  listEnglish(q?: string, page?: number, limit?: number) { return this.repo.listEnglish(q, page, limit); } createEnglishTerm(input: {term:string;slug:string}) { return this.repo.createEnglishTerm(input); } updateEnglishTerm(id:string,input:{term?:string;slug?:string}) { return this.repo.updateEnglishTerm(id,input); } deleteEnglishTerm(id:string, force?: boolean) { return this.repo.deleteEnglishTerm(id, force); }
  listAssamese(q?: string, page?: number, limit?: number) { return this.repo.listAssamese(q, page, limit); } createAssameseTerm(input: {term:string;slug:string}) { return this.repo.createAssameseTerm(input); } updateAssameseTerm(id:string,input:{term?:string;slug?:string}) { return this.repo.updateAssameseTerm(id,input); } deleteAssameseTerm(id:string, force?: boolean) { return this.repo.deleteAssameseTerm(id, force); }
  listMappings(q?: string, page?: number, limit?: number) { return this.repo.listMappings(q, page, limit); } createMapping(input:{english_id:string;assamese_id:string}) { return this.repo.createMapping(input); } deleteMapping(id:string) { return this.repo.deleteMapping(id); }
}

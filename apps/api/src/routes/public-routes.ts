import { z } from 'zod';
import type { FastifyInstance } from 'fastify';
import type { TermService } from '../services/term-service.js';
const paging = { page: z.coerce.number().int().positive().default(1), limit: z.coerce.number().int().positive().max(100).default(20) };
export async function registerPublicRoutes(app: FastifyInstance, service: TermService) {
  app.get('/v1/health', async () => ({ ok: true }));
  app.get('/v1/search', async (req) => { const q = z.object({ q: z.string().min(1), lang: z.enum(['en','as','all']).default('all'), mode: z.enum(['exact','fuzzy']).default('fuzzy'), limit: z.coerce.number().int().positive().max(100).default(20) }).parse(req.query); return service.search(q.q, q); });
  app.get('/v1/terms/en/:slug', async (req) => service.getEnglishTerm(z.object({ slug: z.string() }).parse(req.params).slug));
  app.get('/v1/terms/as/:slug', async (req) => service.getAssameseTerm(z.object({ slug: z.string() }).parse(req.params).slug));
  app.get('/v1/browse/en', async (req) => { const q = z.object({ letter: z.string().optional(), ...paging }).parse(req.query); return service.browseEnglish(q.letter, q.page, q.limit); });
  app.get('/v1/browse/as', async (req) => { const q = z.object({ letter: z.string().optional(), ...paging }).parse(req.query); return service.browseAssamese(q.letter, q.page, q.limit); });
}

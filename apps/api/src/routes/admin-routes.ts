import { z } from 'zod';
import type { FastifyInstance } from 'fastify';
import type { TermService } from '../services/term-service.js';
const paging = { q: z.string().default(''), page: z.coerce.number().int().positive().default(1), limit: z.coerce.number().int().positive().max(100).default(20) };
const termBody = z.object({ term: z.string().min(1), slug: z.string().min(1) });
export async function registerAdminRoutes(app: FastifyInstance, service: TermService) {
  app.addHook('preHandler', app.requireAuth);
  app.get('/v1/admin/stats', async () => service.getStats());
  app.get('/v1/admin/terms/en', async (req) => { const q = z.object(paging).parse(req.query); return service.listEnglish(q.q, q.page, q.limit); });
  app.post('/v1/admin/terms/en', async (req) => service.createEnglishTerm(termBody.parse(req.body)));
  app.put('/v1/admin/terms/en/:id', async (req) => service.updateEnglishTerm(z.object({ id: z.string() }).parse(req.params).id, termBody.partial().parse(req.body)));
  app.delete('/v1/admin/terms/en/:id', async (req, reply) => { const p = z.object({ id: z.string() }).parse(req.params); const q = z.object({ force: z.coerce.boolean().default(false) }).parse(req.query); await service.deleteEnglishTerm(p.id, q.force); return reply.status(204).send(); });
  app.get('/v1/admin/terms/as', async (req) => { const q = z.object(paging).parse(req.query); return service.listAssamese(q.q, q.page, q.limit); });
  app.post('/v1/admin/terms/as', async (req) => service.createAssameseTerm(termBody.parse(req.body)));
  app.put('/v1/admin/terms/as/:id', async (req) => service.updateAssameseTerm(z.object({ id: z.string() }).parse(req.params).id, termBody.partial().parse(req.body)));
  app.delete('/v1/admin/terms/as/:id', async (req, reply) => { const p = z.object({ id: z.string() }).parse(req.params); const q = z.object({ force: z.coerce.boolean().default(false) }).parse(req.query); await service.deleteAssameseTerm(p.id, q.force); return reply.status(204).send(); });
  app.get('/v1/admin/mappings', async (req) => { const q = z.object(paging).parse(req.query); return service.listMappings(q.q, q.page, q.limit); });
  app.post('/v1/admin/mappings', async (req) => service.createMapping(z.object({ english_id: z.string(), assamese_id: z.string() }).parse(req.body)));
  app.delete('/v1/admin/mappings/:id', async (req, reply) => { await service.deleteMapping(z.object({ id: z.string() }).parse(req.params).id); return reply.status(204).send(); });
}

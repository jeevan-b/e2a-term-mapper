import { z } from 'zod';
import type { FastifyInstance } from 'fastify';
import type { AuthService } from '../services/auth-service.js';
export async function registerAuthRoutes(app: FastifyInstance, auth: AuthService) { app.post('/v1/auth/login', async (req) => { const body = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body); return auth.login(body.email, body.password); }); app.post('/v1/auth/logout', async (_req, reply) => reply.status(204).send()); }

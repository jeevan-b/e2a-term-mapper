import fp from 'fastify-plugin';
import { UnauthorizedError } from '../errors/http-errors.js';
import type { AuthPayload, AuthService } from '../services/auth-service.js';
declare module 'fastify' { interface FastifyRequest { user?: AuthPayload } }
export const authPlugin = (auth: AuthService) => fp(async (fastify) => { fastify.decorate('requireAuth', async (request) => { const header = request.headers.authorization; if (!header?.startsWith('Bearer ')) throw new UnauthorizedError(); request.user = auth.verifyToken(header.slice(7)); }); });
declare module 'fastify' { interface FastifyInstance { requireAuth(request: FastifyRequest): Promise<void> } }

import cors from '@fastify/cors';
import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler, ZodError } from 'fastify-type-provider-zod';
import { env } from './env.js';
import { HttpError } from './errors/http-errors.js';
import { authPlugin } from './plugins/auth.js';
import { JsonTermRepository } from './repositories/json-term-repository.js';
import { AuthService } from './services/auth-service.js';
import { TermService } from './services/term-service.js';
import { registerAdminRoutes } from './routes/admin-routes.js';
import { registerAuthRoutes } from './routes/auth-routes.js';
import { registerPublicRoutes } from './routes/public-routes.js';

export async function buildServer() {
  const app = Fastify({ logger: env.NODE_ENV !== 'test' });
  app.setValidatorCompiler(validatorCompiler); app.setSerializerCompiler(serializerCompiler);
  app.register(cors, { origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN });
  const repo = await JsonTermRepository.create(env.DATA_FILE_PATH);
  const termService = new TermService(repo); const authService = new AuthService(repo, env.JWT_SECRET);
  app.setErrorHandler((error, _request, reply) => { if (error instanceof HttpError) return reply.status(error.statusCode).send({ error: error.message }); if (error instanceof ZodError) return reply.status(400).send({ error: error.message }); app.log.error(error); return reply.status(500).send({ error: 'Internal server error' }); });
  await registerPublicRoutes(app, termService); await registerAuthRoutes(app, authService); await app.register(authPlugin(authService)); await app.register(async (admin) => registerAdminRoutes(admin, termService));
  return app;
}

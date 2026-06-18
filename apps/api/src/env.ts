import { config } from 'dotenv';
import { z } from 'zod';
config();
export const env = z.object({ NODE_ENV: z.enum(['development','test','production']).default('development'), PORT: z.coerce.number().default(3000), JWT_SECRET: z.string().min(16).default('development-secret-change-me'), DATA_FILE_PATH: z.string().default('../../data/terms.json'), CORS_ORIGIN: z.string().default('*') }).parse(process.env);

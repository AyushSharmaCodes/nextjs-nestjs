import { z } from 'zod';

export const GlobalEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).optional(),
  CORS_ORIGIN: z.string().optional(),
  DB_HOST: z.string().optional(),
  DB_PORT: z.string().transform(Number).optional(),
  DB_USERNAME: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_NAME: z.string().optional(),
  DB_SSL: z.string().optional(),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.string().transform(Number).optional(),
  REDIS_URL: z.string().optional(),
});

export function validateEnvironment(config: Record<string, unknown>, additionalSchema?: z.ZodTypeAny) {
  const schema = additionalSchema
    ? GlobalEnvSchema.merge(additionalSchema as z.ZodObject<any, any>)
    : GlobalEnvSchema;

  const result = schema.safeParse(config);

  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.format());
    process.exit(1);
  }

  return result.data;
}

import 'dotenv/config';
import { z } from 'zod';

// Validar las variables de entorno al iniciar la app.
// Falla rápido con un mensaje claro si falta algo crítico o el formato es inválido.
const esquemaVariablesEntorno = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es obligatorio'),
  PORT: z
    .string()
    .default('3000')
    .transform((valor) => Number.parseInt(valor, 10))
    .pipe(z.number().int().positive()),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  // JWT_SECRET con longitud mínima para evitar secretos débiles que faciliten
  // el brute-force de la firma del token.
  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  // jsonwebtoken acepta formatos legibles como '1d', '8h', '3600s'.
  // Se pasa directo a jwt.sign sin parsear a segundos.
  JWT_EXPIRES_IN: z.string().min(1).default('1d'),
  CORS_ORIGIN: z.string().min(1, 'CORS_ORIGIN es obligatorio'),
  // Nivel de log de Pino: silent, trace, debug, info, warn, error, fatal.
  // Opcional; por defecto el logger usa 'info' en producción y 'debug' en otros.
  LOG_LEVEL: z.string().optional(),
});

const resultado = esquemaVariablesEntorno.safeParse(process.env);

if (!resultado.success) {
  console.error('Variables de entorno inválidas:');
  resultado.error.issues.forEach((issue) => {
    console.log(`${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = resultado.data;

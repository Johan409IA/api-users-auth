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
});

const resultado = esquemaVariablesEntorno.safeParse(process.env);

if (!resultado.success) {
  console.error('Variables de entorno inválidas:');
  resultado.error.issues.forEach((issue) => {
    console.log(`${issue.path.join('.')}: ${issue.message}`)
  })
  process.exit(1);
}

export const env = resultado.data;

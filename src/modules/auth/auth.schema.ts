import { z } from 'zod';
import {
  CONTRASENA_MAXIMA,
  esquemaEmail,
  esquemaNombre,
  esquemaPassword,
} from '../users/users.schema';

// Registro público: NO se incluye `rol`. El service siempre crea usuarios con
// rol USER para evitar auto-elevación de privilegios desde un endpoint público.
export const registrarSchema = z
  .object({
    name: esquemaNombre,
    email: esquemaEmail,
    password: esquemaPassword,
  })
  .strict()
  .superRefine((datos, ctx) => {
    const passwordLower = datos.password.toLowerCase();
    if (passwordLower.includes(datos.email.toLowerCase())) {
      ctx.addIssue({
        code: 'custom',
        message: 'La contraseña no puede contener el email',
        path: ['password'],
      });
    }
    if (passwordLower.includes(datos.name.toLowerCase())) {
      ctx.addIssue({
        code: 'custom',
        message: 'La contraseña no puede contener el nombre',
        path: ['password'],
      });
    }
  });

export const loginSchema = z
  .object({
    email: esquemaEmail,
    password: z
      .string()
      .min(1, 'La contraseña es obligatoria')
      .max(CONTRASENA_MAXIMA, 'Contraseña demasiado larga'),
  })
  .strict();

export type RegistroInput = z.infer<typeof registrarSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

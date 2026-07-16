import { z } from 'zod';
import { esquemaEmail, esquemaPassword } from '../users/users.schema';

// Registro público: NO se incluye `rol`. El service siempre crea usuarios con
// rol USER para evitar auto-elevación de privilegios desde un endpoint público.
export const registrarSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: esquemaEmail,
  password: esquemaPassword,
});

export const loginSchema = z.object({
  email: esquemaEmail,
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export type RegistroInput = z.infer<typeof registrarSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

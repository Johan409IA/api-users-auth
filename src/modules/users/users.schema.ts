import { z } from 'zod';

// Roles permitidos vienen del enum de Prisma. Mantener sincronizado con prisma/schema.prisma.
const rolesPermitidos = z.enum(['USER', 'ADMIN']);

// 72 es el límite máximo que acepta bcrypt. Lo respetamos para evitar truncamiento silencioso.
const CONTRASENA_MAXIMA = 72;

// Regla: el email se guarda SIEMPRE en minúsculas y sin espacios.
// `.trim()` y `.toLowerCase()` se aplican en `.transform` antes de validar el formato final.
const esquemaEmail = z.string().trim().toLowerCase().pipe(z.email().max(255));

export const crearUsuarioSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: esquemaEmail,
  password: z
    .string()
    .min(8)
    .max(CONTRASENA_MAXIMA)
    .regex(/[A-Z]/, 'Debe incluir al menos una mayúscula')
    .regex(/\d/, 'Debe incluir al menos un número'),
  rol: rolesPermitidos.default('USER'),
});

export const actualizarUsuarioSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    email: esquemaEmail.optional(),
    password: z
      .string()
      .min(8)
      .max(CONTRASENA_MAXIMA)
      .regex(/[A-Z]/, 'Debe incluir al menos una mayúscula')
      .regex(/\d/, 'Debe incluir al menos un número')
      .optional(),
    rol: rolesPermitidos.optional(),
    isActive: z.boolean().optional(),
  })
  .refine((datos) => Object.keys(datos).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar',
  });

export const obtenerUsuarioPorIdSchema = z.object({
  id: z.uuid(),
});

export type CrearUsuarioInput = z.infer<typeof crearUsuarioSchema>;
export type ActualizarUsuarioInput = z.infer<typeof actualizarUsuarioSchema>;
export type ObtenerUsuarioPorIdInput = z.infer<typeof obtenerUsuarioPorIdSchema>;

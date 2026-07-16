import { z } from 'zod';

// Roles permitidos vienen del enum de Prisma. Mantener sincronizado con prisma/schema.prisma.
const rolesPermitidos = z.enum(['USER', 'ADMIN']);

// 72 es el límite máximo que acepta bcrypt. Lo respetamos para evitar truncamiento silencioso.
export const CONTRASENA_MAXIMA = 72;

// Regla: el email se guarda SIEMPRE en minúsculas y sin espacios.
// `.trim()` y `.toLowerCase()` se aplican en `.transform` antes de validar el formato final.
export const esquemaEmail = z.string().trim().toLowerCase().pipe(z.email().max(255));

// Validación de nombre: solo letras, números y espacios. Se normalizan espacios múltiples.
export const esquemaNombre = z
  .string()
  .trim()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(100, 'El nombre no puede exceder 100 caracteres')
  .regex(/^[\p{L}\p{N}\s]+$/u, 'Solo se permiten letras, números y espacios')
  .transform((valor) => valor.replace(/\s+/g, ' '));

// Reglas de contraseña reutilizables por el módulo de auth (registro/login).
// Requiere mayúscula, minúscula, número y símbolo.
export const esquemaPassword = z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .max(CONTRASENA_MAXIMA, 'Máximo 72 caracteres')
  .regex(/[A-Z]/, 'Debe incluir al menos una mayúscula')
  .regex(/[a-z]/, 'Debe incluir al menos una minúscula')
  .regex(/\d/, 'Debe incluir al menos un número')
  .regex(/[^A-Za-z0-9]/, 'Debe incluir al menos un símbolo');

// Refinamiento para evitar que la contraseña contenga el email o el nombre.
function validarPasswordNoContieneDatos(
  datos: { password: string; email?: string; name?: string },
  ctx: z.RefinementCtx,
): void {
  const passwordLower = datos.password.toLowerCase();
  if (datos.email && passwordLower.includes(datos.email.toLowerCase())) {
    ctx.addIssue({
      code: "custom",
      message: 'La contraseña no puede contener el email',
      path: ['password'],
    });
  }
  if (datos.name && passwordLower.includes(datos.name.toLowerCase())) {
    ctx.addIssue({
      code: "custom",
      message: 'La contraseña no puede contener el nombre',
      path: ['password'],
    });
  }
}

export const crearUsuarioSchema = z
  .object({
    name: esquemaNombre,
    email: esquemaEmail,
    password: esquemaPassword,
    rol: rolesPermitidos.default('USER'),
  })
  .strict()
  .superRefine(validarPasswordNoContieneDatos);

export const actualizarUsuarioSchema = z
  .object({
    name: esquemaNombre.optional(),
    email: esquemaEmail.optional(),
    password: esquemaPassword.optional(),
    rol: rolesPermitidos.optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((datos) => Object.keys(datos).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar',
  })
  .superRefine((datos, ctx) => {
    // Solo validar password si se está actualizando.
    if (datos.password) {
      validarPasswordNoContieneDatos(
        { password: datos.password, email: datos.email, name: datos.name },
        ctx,
      );
    }
  });

export const obtenerUsuarioPorIdSchema = z
  .object({
    id: z.uuid(),
  })
  .strict();

export type CrearUsuarioInput = z.infer<typeof crearUsuarioSchema>;
export type ActualizarUsuarioInput = z.infer<typeof actualizarUsuarioSchema>;
export type ObtenerUsuarioPorIdInput = z.infer<typeof obtenerUsuarioPorIdSchema>;

import type { UserModel } from '../../generated/prisma/models/User';

// DTO de salida: NUNCA incluye `password` (regla de seguridad transversal al módulo).
// El service mapea a este tipo antes de responder.
export type UsuarioDto = Omit<UserModel, 'password'>;

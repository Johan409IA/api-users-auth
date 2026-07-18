import type { UserModel } from '../../generated/prisma/models/User.js';
import type { UsuarioDto } from '../../modules/users/users.types.js';

// Regla de seguridad transversal: NUNCA devolver el campo `password` en las
// respuestas de la API. Centralizar el mapper evita que el filtro se duplique
// y se olvide en algún módulo (auth, users, etc.).
export function mapearAUsuarioDto<T extends UserModel>(usuario: T): UsuarioDto {
  const { password: _omitir, ...resto } = usuario;
  return resto as unknown as UsuarioDto;
}

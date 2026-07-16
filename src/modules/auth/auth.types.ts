import type { UserModel } from '../../generated/prisma/models/User';

// Payload mínimo del JWT. No incluir email/name/isActive:
// - isActive debe consultarse en BD en cada /me (no hay revocación de tokens).
// - datos de perfil caducan con el token y se desactualizarían.
export interface CargaUtilJwt {
  sub: string; // id del usuario (claim estándar)
  rol: UserModel['rol']; // 'USER' | 'ADMIN'
}

// Lo que el middleware `autenticar` inyecta en `req.user` tras verificar el token.
export interface UsuarioAutenticado {
  id: string;
  rol: UserModel['rol'];
}

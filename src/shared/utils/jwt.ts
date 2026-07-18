import jwt from 'jsonwebtoken';
import type ms from 'ms';
import { env } from '../../config/env.js';
import type { CargaUtilJwt } from '../../modules/auth/auth.types.js';

// Análogo a shared/utils/hash: aísla la criptografía (firma/verificación JWT)
// para que el service y el middleware la consuman sin acoplarse entre sí.
export function firmarToken(carga: CargaUtilJwt): string {
  return jwt.sign(carga, env.JWT_SECRET, {
    // StringValue es un tipo "branded" de `ms` (template literal). El valor viene
    // validado por Zod como string no vacío; el cast cumple el contrato de jwt.sign.
    expiresIn: env.JWT_EXPIRES_IN as ms.StringValue,
  });
}

export function verificarToken(token: string): CargaUtilJwt {
  // jwt.verify lanza JsonWebTokenError/TokenExpiredError si el token es inválido
  // o expiró; el middleware `autenticar` se encarga de traducirlo a 401.
  return jwt.verify(token, env.JWT_SECRET) as CargaUtilJwt;
}

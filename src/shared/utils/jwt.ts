import jwt from 'jsonwebtoken';
import type ms from 'ms';

import { env } from '../../config/env.js';
import type { CargaUtilJwt } from '../../modules/auth/auth.types.js';
import { ErrorNoAutorizadoError } from '../errors/error.js';

// Análogo a shared/utils/hash: aísla la criptografía (firma/verificación JWT)
// para que el service y el middleware la consuman sin acoplarse entre sí.
export function firmarToken(carga: CargaUtilJwt): string {
  return jwt.sign(carga, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as ms.StringValue,
  });
}

export function verificarToken(token: string): CargaUtilJwt {
  try {
    return jwt.verify(token, env.JWT_SECRET) as CargaUtilJwt;
  } catch (error) {
    if (error instanceof Error) {
      switch (error.name) {
        case 'TokenExpiredError':
          throw new ErrorNoAutorizadoError('Token expirado');

        case 'JsonWebTokenError':
          throw new ErrorNoAutorizadoError('Token inválido');
      }
    }

    throw new ErrorNoAutorizadoError('No se pudo verificar el token');
  }
}
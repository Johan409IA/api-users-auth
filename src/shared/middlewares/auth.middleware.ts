import type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';

import type { UserModel } from '../../generated/prisma/models/User.js';
import type { UsuarioAutenticado } from '../../modules/auth/auth.types.js';
import {
  ErrorNoAutorizadoError,
  ErrorProhibidoError,
} from '../errors/error.js';
import { verificarToken } from '../utils/jwt.js';

// Middleware de autenticación: valida el JWT enviado en la cabecera
// `Authorization: Bearer <token>` e inyecta el usuario autenticado en `req.user`.
export const autenticar: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const cabecera = req.headers.authorization;

  if (!cabecera?.startsWith('Bearer ')) {
    next(new ErrorNoAutorizadoError('Token de autenticación no proporcionado'));
    return;
  }

  try {
    const token = cabecera.slice('Bearer '.length).trim();
    const carga = verificarToken(token);

    req.user = {
      id: carga.sub,
      rol: carga.rol,
    } satisfies UsuarioAutenticado;

    next();
  } catch (error) {
    req.log.warn(
      {
        evento: 'seguridad',
        tipo: 'token_invalido',
        ip: req.ip,
      },
      error instanceof Error ? error.message : 'Error verificando token',
    );

    next(error);
  }
};

// Guard de autorización por roles.
export function requiereRol(...roles: UserModel['rol'][]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new ErrorNoAutorizadoError('Autenticación requerida'));
      return;
    }

    if (!roles.includes(req.user.rol)) {
      next(new ErrorProhibidoError('No tienes permiso para acceder a este recurso'));
      return;
    }

    next();
  };
}
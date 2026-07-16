import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { UserModel } from '../../generated/prisma/models/User';
import type { UsuarioAutenticado } from '../../modules/auth/auth.types';
import { ErrorNoAutorizadoError, ErrorProhibidoError } from '../errors/error';
import { verificarToken } from '../utils/jwt';

// Middleware de autenticación: valida el JWT enviado en la cabecera
// `Authorization: Bearer <token>` e inyecta el usuario autenticado en `req.user`.
export const autenticar: RequestHandler = (req: Request, _res: Response, next: NextFunction) => {
  const cabecera = req.headers.authorization;
  if (!cabecera?.startsWith('Bearer ')) {
    next(new ErrorNoAutorizadoError('Token de autenticación no proporcionado'));
    return;
  }
  try {
    const token = cabecera.slice('Bearer '.length).trim();
    const carga = verificarToken(token);
    req.user = { id: carga.sub, rol: carga.rol } satisfies UsuarioAutenticado;
    next();
  } catch {
    next(new ErrorNoAutorizadoError('Token inválido o expirado'));
  }
};

// Guard de autorización por roles. Devuelve un RequestHandler que rechaza con
// 403 si el usuario autenticado no tiene uno de los roles requeridos.
// Creado y disponible, pero NO cableado a las rutas de /users en este plan.
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

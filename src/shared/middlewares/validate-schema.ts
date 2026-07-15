import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { ErrorDeValidacion } from '../errors/error';

type PropiedadValidable = 'body' | 'params' | 'query';

export function validar<T extends ZodType>(esquema: T, propiedad: PropiedadValidable) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const resultado = esquema.safeParse(req[propiedad]);
    if (!resultado.success) {
      next(new ErrorDeValidacion('Datos de entrada inválidos', resultado.error.issues));
      return;
    }
    // Sustituye la propiedad por el valor parseado (incluye transformaciones, defaults, etc.).
    Object.assign(req, { [propiedad]: resultado.data });
    next();
  };
}

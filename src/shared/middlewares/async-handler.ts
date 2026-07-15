import type { NextFunction, Request, RequestHandler, Response } from 'express';

// Envuelve un handler async para que sus rechazos lleguen a next(err)
// y los capture el manejador global de errores. Útil con handlers de
// libs externas que aún no aprovechan el soporte nativo de async en Express 5.
export const envoltorioAsync =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

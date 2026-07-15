import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { AppError, ErrorDeValidacion } from '../errors/error';

// Manejador global de errores. Debe ser el ÚLTIMO middleware registrado.
// En producción nunca expone el mensaje interno al cliente para no filtrar
// detalles de implementación (rutas de archivos, queries SQL, etc.).
// El cuarto parámetro `next` es obligatorio para que Express lo reconozca como error handler.
export function manejadorDeErrores(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof ZodError) {
    const validacion = new ErrorDeValidacion('Datos de entrada inválidos', error.issues);
    logger.warn({ detalles: validacion.detalles }, validacion.message);
    res.status(validacion.statusCode).json({
      error: { mensaje: validacion.message, detalles: validacion.detalles },
    });
    return;
  }

  if (error instanceof AppError) {
    if (error.esOperacional) {
      logger.warn({ mensaje: error.message, detalles: error.detalles }, 'Error operacional');
    } else {
      logger.error({ mensaje: error.message, stack: error.stack }, 'Error de aplicación');
    }
    res.status(error.statusCode).json({
      error: { mensaje: error.message, ...(error.detalles ? { detalles: error.detalles } : {}) },
    });
    return;
  }

  const mensaje = error instanceof Error ? error.message : 'Error interno del servidor';
  const stack = error instanceof Error ? error.stack : undefined;
  logger.error({ mensaje, stack }, 'Error no controlado');
  res.status(500).json({
    error: {
      mensaje: 'Error interno del servidor',
      ...(env.NODE_ENV !== 'production' && mensaje ? { detalle: mensaje } : {}),
      ...(env.NODE_ENV !== 'production' && stack ? { stack } : {}),
    },
  });
}

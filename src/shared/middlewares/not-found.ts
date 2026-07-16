import type { RequestHandler } from 'express';

// Responde 404 directamente sin pasar por el error-handler para no loggear
// rutas inexistentes que bots y escáneres generan continuamente en producción.
export const manejarRutaNoEncontrada: RequestHandler = (_req, res) => {
  res.status(404).json({ error: { mensaje: 'Recurso no encontrado' } });
};

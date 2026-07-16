import rateLimit from 'express-rate-limit';

const VENTANA_MS = 15 * 60 * 1000; // 15 minutos
const MENSAJE_LIMITE = { error: { mensaje: 'Demasiadas solicitudes. Intentalo mas tarde.' } };

// Limitador global mas permisivo para toda la API. Protege contra abuso general
// sin afectar navegacion normal. Se aplica solo a rutas /api/* (no a /health).
export const limiteGlobal = rateLimit({
  windowMs: VENTANA_MS,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json(MENSAJE_LIMITE),
});

// Limitador estricto para endpoints de autenticacion. Login y register comparten
// bucket: ambos son vectores de fuerza bruta.
export const limiteAuth = rateLimit({
  windowMs: VENTANA_MS,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json(MENSAJE_LIMITE),
});

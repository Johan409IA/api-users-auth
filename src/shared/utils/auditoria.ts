import type { Request } from 'express';

const CLAVES_SENSIBLES = ['password', 'token'];

function sanitizarCambios(cambios: Record<string, unknown>): Record<string, unknown> {
  const copia = { ...cambios };
  for (const clave of CLAVES_SENSIBLES) {
    if (clave in copia) copia[clave] = '[REDACTED]';
  }
  return copia;
}

// Emite un log de auditoria vinculado al request actual. Usa req.log para
// heredar automaticamente requestId y contexto del usuario autenticado.
export function loggearAuditoria(
  req: Request,
  accion: string,
  recursoId: string,
  cambios?: Record<string, unknown>,
): void {
  req.log.info(
    {
      evento: 'auditoria',
      actorId: req.user?.id,
      accion,
      recursoId,
      ...(cambios && { cambios: sanitizarCambios(cambios) }),
    },
    `Auditoria: ${accion}`,
  );
}

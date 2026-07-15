// Clase base para errores operacionales de la aplicación.
// esOperacional distingue errores esperados (regla de negocio, validación) de
// errores de programación que deberían crashear el proceso.
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly esOperacional: boolean;
  public readonly detalles?: unknown;

  constructor(mensaje: string, statusCode: number, esOperacional = true, detalles?: unknown) {
    super(mensaje);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.esOperacional = esOperacional;
    this.detalles = detalles;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class RecursoNoEncontradoError extends AppError {
  constructor(mensaje: string) {
    super(mensaje, 404);
  }
}

export class ConflictoError extends AppError {
  constructor(mensaje: string) {
    super(mensaje, 409);
  }
}

export class EmailYaRegistradoError extends ConflictoError {
  constructor() {
    super('El email ya está registrado');
  }
}

export class ErrorDeValidacion extends AppError {
  constructor(mensaje: string, detalles?: unknown) {
    super(mensaje, 400, true, detalles);
  }
}

export class ErrorNoAutorizadoError extends AppError {
  constructor(mensaje: string) {
    super(mensaje, 401);
  }
}

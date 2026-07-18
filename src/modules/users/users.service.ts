import {
  EmailYaRegistradoError,
  ErrorDeValidacion,
  RecursoNoEncontradoError,
} from '../../shared/errors/error.js';
import { mapearAUsuarioDto } from '../../shared/mappers/usuario.mapper.js';
import { hashear } from '../../shared/utils/hash.js';
import * as repositorioUsuarios from './users.repository.js';
import type {
  ActualizarUsuarioInput,
  CrearUsuarioInput,
  ObtenerUsuarioPorIdInput,
} from './users.schema.js';
import type { UsuarioDto } from './users.types.js';

const REGEX_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function listarUsuarios(): Promise<UsuarioDto[]> {
  const usuarios = await repositorioUsuarios.obtenerTodos();
  return usuarios.map(mapearAUsuarioDto);
}

export async function obtenerUsuarioPorId(entrada: ObtenerUsuarioPorIdInput): Promise<UsuarioDto> {
  // Defensa en profundidad: aunque el middleware valide el schema, nos aseguramos
  // de que el id tenga formato UUID antes de ir a la BD.
  if (!REGEX_UUID.test(entrada.id)) {
    throw new ErrorDeValidacion('El id proporcionado no es un UUID válido');
  }
  const usuario = await repositorioUsuarios.obtenerPorId(entrada.id);
  if (!usuario) {
    throw new RecursoNoEncontradoError('Usuario no encontrado');
  }
  return mapearAUsuarioDto(usuario);
}

export async function crearUsuario(entrada: CrearUsuarioInput): Promise<UsuarioDto> {
  const existente = await repositorioUsuarios.obtenerPorEmail(entrada.email);
  if (existente) {
    throw new EmailYaRegistradoError();
  }
  const passwordHasheado = await hashear(entrada.password);
  const usuario = await repositorioUsuarios.crear({
    name: entrada.name,
    email: entrada.email,
    password: passwordHasheado,
    rol: entrada.rol,
  });
  return mapearAUsuarioDto(usuario);
}

export async function actualizarUsuario(
  entradaId: ObtenerUsuarioPorIdInput,
  entrada: ActualizarUsuarioInput,
): Promise<UsuarioDto> {
  if (!REGEX_UUID.test(entradaId.id)) {
    throw new ErrorDeValidacion('El id proporcionado no es un UUID válido');
  }
  const usuarioActual = await repositorioUsuarios.obtenerPorId(entradaId.id);
  if (!usuarioActual) {
    throw new RecursoNoEncontradoError('Usuario no encontrado');
  }

  // Si viene email, validar unicidad excluyendo al propio usuario.
  if (entrada.email && entrada.email !== usuarioActual.email) {
    const existente = await repositorioUsuarios.obtenerPorEmail(entrada.email);
    if (existente) {
      throw new EmailYaRegistradoError();
    }
  }

  // Defensa en profundidad: validar que la nueva contraseña no contenga
  // el email o nombre actuales del usuario (cuando no se envían en el body).
  if (entrada.password) {
    const passwordLower = entrada.password.toLowerCase();
    if (
      passwordLower.includes(usuarioActual.email.toLowerCase()) ||
      passwordLower.includes(usuarioActual.name.toLowerCase())
    ) {
      throw new ErrorDeValidacion('La contraseña no puede contener el email ni el nombre');
    }
  }

  const passwordHasheado = entrada.password ? await hashear(entrada.password) : undefined;

  try {
    const usuario = await repositorioUsuarios.actualizar(entradaId.id, {
      ...(entrada.name !== undefined && { name: entrada.name }),
      ...(entrada.email !== undefined && { email: entrada.email }),
      ...(passwordHasheado !== undefined && { password: passwordHasheado }),
      ...(entrada.rol !== undefined && { rol: entrada.rol }),
      ...(entrada.isActive !== undefined && { isActive: entrada.isActive }),
    });
    return mapearAUsuarioDto(usuario);
  } catch (error) {
    // Carrera: el registro se borró entre el GET previo y el UPDATE.
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
      throw new RecursoNoEncontradoError('Usuario no encontrado');
    }
    throw error;
  }
}

export async function eliminarUsuario(entrada: ObtenerUsuarioPorIdInput): Promise<UsuarioDto> {
  if (!REGEX_UUID.test(entrada.id)) {
    throw new ErrorDeValidacion('El id proporcionado no es un UUID válido');
  }
  try {
    const usuario = await repositorioUsuarios.eliminar(entrada.id);
    return mapearAUsuarioDto(usuario);
  } catch (error) {
    // Prisma lanza P2025 cuando el registro no existe para update/delete.
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
      throw new RecursoNoEncontradoError('Usuario no encontrado');
    }
    throw error;
  }
}

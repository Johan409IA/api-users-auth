import { ErrorNoAutorizadoError, RecursoNoEncontradoError } from '../../shared/errors/error';
import { mapearAUsuarioDto } from '../../shared/mappers/usuario.mapper';
import { comparar } from '../../shared/utils/hash';
import { firmarToken } from '../../shared/utils/jwt';
import * as repositorioUsuarios from '../users/users.repository';
import * as servicioUsuarios from '../users/users.service';
import type { UsuarioDto } from '../users/users.types';
import type { LoginInput, RegistroInput } from './auth.schema';

export interface RespuestaAuth {
  token: string;
  usuario: UsuarioDto;
}

// Registro: delega la creación al servicio de users (único dueño de la regla
// email-único + hashear + persistir) y emite el token. El rol se fuerza a USER
// para evitar auto-elevación de privilegios desde un endpoint público.
export async function registrar(entrada: RegistroInput): Promise<RespuestaAuth> {
  const usuario = await servicioUsuarios.crearUsuario({ ...entrada, rol: 'USER' });
  const token = firmarToken({ sub: usuario.id, rol: usuario.rol });
  return { token, usuario };
}

// Login: mensaje uniforme para no filtrar si el email existe o si la cuenta
// está inactiva (evita enumeración de usuarios).
export async function login(entrada: LoginInput): Promise<RespuestaAuth> {
  const usuario = await repositorioUsuarios.obtenerPorEmail(entrada.email);
  if (!usuario?.isActive) {
    throw new ErrorNoAutorizadoError('Credenciales inválidas');
  }
  const credencialesValidas = await comparar(entrada.password, usuario.password);
  if (!credencialesValidas) {
    throw new ErrorNoAutorizadoError('Credenciales inválidas');
  }
  const token = firmarToken({ sub: usuario.id, rol: usuario.rol });
  return { token, usuario: mapearAUsuarioDto(usuario) };
}

// Perfil autenticado: consulta la BD para reflejar el estado real del usuario
// (isActive, datos actualizados) en lugar de fiarse del token.
export async function obtenerPerfil(usuarioId: string): Promise<UsuarioDto> {
  const usuario = await repositorioUsuarios.obtenerPorId(usuarioId);
  if (!usuario) {
    throw new RecursoNoEncontradoError('Usuario no encontrado');
  }
  return mapearAUsuarioDto(usuario);
}

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/app';
import { prisma, limpiarBaseDeDatos, crearUsuarioDePrueba } from '../helpers/db';
import { generarToken } from '../helpers/auth';

const SECRETO = process.env.JWT_SECRET!;

beforeEach(async () => {
  await limpiarBaseDeDatos();
});

describe('GET /api/auth/me', () => {
  it('usuario autenticado obtiene su perfil sin password', async () => {
    const usuario = await crearUsuarioDePrueba({
      name: 'Perfil Test',
      email: 'perfil@example.com',
    });
    const token = generarToken({ sub: usuario.id, rol: usuario.rol as 'USER' | 'ADMIN' });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const { datos } = res.body;
    expect(datos.id).toBe(usuario.id);
    expect(datos.email).toBe('perfil@example.com');
    expect(datos).not.toHaveProperty('password');
  });

  it('sin token devuelve 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .expect(401);

    expect(res.body.error.mensaje).toBe('Token de autenticación no proporcionado');
  });

  it('token inválido (basura) devuelve 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer token_invalido_basura')
      .expect(401);

    expect(res.body.error.mensaje).toBe('Token inválido o expirado');
  });

  it('token expirado devuelve 401', async () => {
    const usuario = await crearUsuarioDePrueba();
    const tokenExpirado = jwt.sign(
      { sub: usuario.id, rol: 'USER' },
      SECRETO,
      { expiresIn: '0s' },
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tokenExpirado}`)
      .expect(401);

    expect(res.body.error.mensaje).toBe('Token inválido o expirado');
  });

  it('usuario eliminado tras obtener token devuelve 404', async () => {
    const usuario = await crearUsuarioDePrueba({
      email: 'borrado@example.com',
    });
    const token = generarToken({ sub: usuario.id, rol: 'USER' });
    await prisma.user.delete({ where: { id: usuario.id } });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(res.body.error.mensaje).toBe('Usuario no encontrado');
  });
});

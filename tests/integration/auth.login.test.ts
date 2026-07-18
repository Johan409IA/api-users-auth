import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { prisma, limpiarBaseDeDatos, crearUsuarioDePrueba } from '../helpers/db';

beforeEach(async () => {
  await limpiarBaseDeDatos();
});

describe('POST /api/auth/login', () => {
  it('login exitoso devuelve token + usuario sin password', async () => {
    await crearUsuarioDePrueba({
      name: 'Login Test',
      email: 'login@example.com',
      password: 'Abc1234!',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'Abc1234!' })
      .expect(200);

    const { datos } = res.body;
    expect(datos.token).toBeTypeOf('string');
    expect(datos.token.length).toBeGreaterThan(0);
    expect(datos.usuario).toBeDefined();
    expect(datos.usuario.email).toBe('login@example.com');
    expect(datos.usuario).not.toHaveProperty('password');
  });

  it('contraseña incorrecta devuelve 401 con mensaje uniforme', async () => {
    await crearUsuarioDePrueba({
      email: 'login@example.com',
      password: 'Abc1234!',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'WrongPass1!' })
      .expect(401);

    expect(res.body.error.mensaje).toBe('Credenciales inválidas');
  });

  it('email inexistente devuelve 401 con el mismo mensaje uniforme', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noexiste@example.com', password: 'Abc1234!' })
      .expect(401);

    expect(res.body.error.mensaje).toBe('Credenciales inválidas');
  });

  it('cuenta inactiva devuelve 401 con el mismo mensaje uniforme', async () => {
    await crearUsuarioDePrueba({
      email: 'inactivo@example.com',
      password: 'Abc1234!',
      isActive: false,
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inactivo@example.com', password: 'Abc1234!' })
      .expect(401);

    expect(res.body.error.mensaje).toBe('Credenciales inválidas');
  });

  it('campos faltantes devuelve 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com' })
      .expect(400);

    expect(res.body.error.mensaje).toBe('Datos de entrada inválidos');
  });
});

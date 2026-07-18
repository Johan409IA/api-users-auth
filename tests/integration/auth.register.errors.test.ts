import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { limpiarBaseDeDatos, crearUsuarioDePrueba } from '../helpers/db';

beforeEach(async () => {
  await limpiarBaseDeDatos();
});

describe('POST /api/auth/register - errores', () => {
  it('rechaza email duplicado con 409', async () => {
    // Crear un usuario previo para forzar el conflicto.
    await crearUsuarioDePrueba({
      name: 'Existente',
      email: 'existe@example.com',
      password: 'Abc1234!',
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Otro',
        email: 'existe@example.com',
        password: 'Abc1234!',
      })
      .expect(409);

    expect(res.body.error.mensaje).toBe('El email ya está registrado');
  });

  it('rechaza campos requeridos faltantes con 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Falta email y password' })
      .expect(400);

    expect(res.body.error.mensaje).toBe('Datos de entrada inválidos');
    expect(res.body.error.detalles).toBeInstanceOf(Array);
  });

  it('rechaza password sin mayúscula', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@test.com', password: 'abc1234!' })
      .expect(400);

    expect(res.body.error.mensaje).toBe('Datos de entrada inválidos');
  });

  it('rechaza password sin símbolo', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@test.com', password: 'Abc12345' })
      .expect(400);

    expect(res.body.error.mensaje).toBe('Datos de entrada inválidos');
  });

  it('rechaza password sin número', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@test.com', password: 'Abcdefg!' })
      .expect(400);

    expect(res.body.error.mensaje).toBe('Datos de entrada inválidos');
  });

  it('rechaza password menor a 8 caracteres', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@test.com', password: 'Ab1!' })
      .expect(400);

    expect(res.body.error.mensaje).toBe('Datos de entrada inválidos');
  });

  it('rechaza password que contiene el email', async () => {
    // El email en minúsculas es 'miemail@test.com'.
    // La contraseña debe contener literalmente ese string para fallar el superRefine.
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test',
        email: 'mi.email@test.com',
        password: 'Mi.email@test.com1',
      })
      .expect(400);

    expect(res.body.error.mensaje).toBe('Datos de entrada inválidos');
  });

  it('rechaza password que contiene el nombre', async () => {
    // El nombre normalizado es 'juan carlos' (minúsculas, espacios normalizados).
    // La contraseña debe contener 'juan carlos' como substring para fallar el superRefine.
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Juan Carlos',
        email: 'test@test.com',
        password: 'Juan Carlos1!',
      })
      .expect(400);

    expect(res.body.error.mensaje).toBe('Datos de entrada inválidos');
  });

  it('rechaza campos extra por strict()', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test',
        email: 'test@test.com',
        password: 'Abc1234!',
        campoInesperado: 'valor',
      })
      .expect(400);

    expect(res.body.error.mensaje).toBe('Datos de entrada inválidos');
  });
});

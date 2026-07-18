# Documentacion de la API REST

API REST para autenticacion y administracion de usuarios.

## Base URL

```http
http://localhost:3000
```

En produccion, reemplazar la URL base por el dominio del servicio desplegado.

## Formato general

Las respuestas exitosas de la API usan el campo `datos`:

```json
{
  "datos": {}
}
```

Las respuestas de error usan el campo `error`:

```json
{
  "error": {
    "mensaje": "Datos de entrada invalidos",
    "detalles": []
  }
}
```

`detalles` solo aparece cuando el error incluye informacion adicional, por ejemplo errores de validacion.

## Autenticacion

Los endpoints protegidos requieren un token JWT en la cabecera:

```http
Authorization: Bearer <token>
```

El token se obtiene desde:

- `POST /api/auth/register`
- `POST /api/auth/login`

## Roles

La API maneja dos roles:

- `USER`
- `ADMIN`

Reglas principales:

- `POST /api/auth/register` siempre crea usuarios con rol `USER`.
- `GET /api/auth/me` requiere cualquier usuario autenticado.
- Todas las rutas de `/api/users` requieren autenticacion y rol `ADMIN`.

## Modelo Usuario

```json
{
  "id": "8b6d2a8b-4b44-4fd6-8a7e-771c7fbc03b6",
  "name": "Juan Perez",
  "email": "juan@example.com",
  "rol": "USER",
  "isActive": true,
  "createdAt": "2026-07-17T15:30:00.000Z",
  "updatedAt": "2026-07-17T15:30:00.000Z"
}
```

El campo `password` nunca se devuelve en las respuestas.

## Reglas de validacion

### Nombre

- Obligatorio en creacion y registro.
- Minimo 2 caracteres.
- Maximo 100 caracteres.
- Solo permite letras, numeros y espacios.
- Normaliza espacios multiples.

### Email

- Obligatorio en creacion, registro y login.
- Se guarda en minusculas y sin espacios al inicio o final.
- Debe tener formato de email valido.
- Maximo 255 caracteres.
- Debe ser unico.

### Password

- Obligatorio en creacion, registro y login.
- Minimo 8 caracteres.
- Maximo 72 caracteres.
- Debe incluir al menos una mayuscula.
- Debe incluir al menos una minuscula.
- Debe incluir al menos un numero.
- Debe incluir al menos un simbolo.
- No puede contener el email.
- No puede contener el nombre.

### Rol

- Valores permitidos: `USER`, `ADMIN`.
- En `POST /api/auth/register` no se acepta `rol`.
- En `POST /api/users`, si no se envia `rol`, se usa `USER`.

## Health

### GET `/health`

Verifica que la API este corriendo.

#### Respuesta `200`

```json
{
  "status": "ok",
  "message": "API corriendo"
}
```

## Auth

### POST `/api/auth/register`

Registra un usuario publico. El usuario creado siempre tendra rol `USER`.

#### Body

```json
{
  "name": "Juan Perez",
  "email": "juan@example.com",
  "password": "Abc1234!"
}
```

#### Respuesta `201`

```json
{
  "datos": {
    "token": "<jwt>",
    "usuario": {
      "id": "8b6d2a8b-4b44-4fd6-8a7e-771c7fbc03b6",
      "name": "Juan Perez",
      "email": "juan@example.com",
      "rol": "USER",
      "isActive": true,
      "createdAt": "2026-07-17T15:30:00.000Z",
      "updatedAt": "2026-07-17T15:30:00.000Z"
    }
  }
}
```

#### Errores

| Estado | Causa |
| --- | --- |
| `400` | Body invalido, campos faltantes, password debil o campos extra |
| `409` | Email ya registrado |
| `429` | Demasiadas solicitudes |

### POST `/api/auth/login`

Autentica un usuario activo y devuelve un token JWT.

#### Body

```json
{
  "email": "juan@example.com",
  "password": "Abc1234!"
}
```

#### Respuesta `200`

```json
{
  "datos": {
    "token": "<jwt>",
    "usuario": {
      "id": "8b6d2a8b-4b44-4fd6-8a7e-771c7fbc03b6",
      "name": "Juan Perez",
      "email": "juan@example.com",
      "rol": "USER",
      "isActive": true,
      "createdAt": "2026-07-17T15:30:00.000Z",
      "updatedAt": "2026-07-17T15:30:00.000Z"
    }
  }
}
```

#### Errores

| Estado | Causa |
| --- | --- |
| `400` | Body invalido o campos faltantes |
| `401` | Credenciales invalidas, usuario inexistente o cuenta inactiva |
| `429` | Demasiadas solicitudes |

> Por seguridad, el login responde con el mismo mensaje para email inexistente, password incorrecta o cuenta inactiva.

### GET `/api/auth/me`

Obtiene el perfil del usuario autenticado.

#### Autenticacion

Requiere token JWT.

#### Respuesta `200`

```json
{
  "datos": {
    "id": "8b6d2a8b-4b44-4fd6-8a7e-771c7fbc03b6",
    "name": "Juan Perez",
    "email": "juan@example.com",
    "rol": "USER",
    "isActive": true,
    "createdAt": "2026-07-17T15:30:00.000Z",
    "updatedAt": "2026-07-17T15:30:00.000Z"
  }
}
```

#### Errores

| Estado | Causa |
| --- | --- |
| `401` | Token no proporcionado, invalido o expirado |
| `404` | El usuario del token ya no existe |

## Users

Todos los endpoints de usuarios requieren token JWT con rol `ADMIN`.

### GET `/api/users`

Lista usuarios ordenados por fecha de creacion descendente.

#### Respuesta `200`

```json
{
  "datos": [
    {
      "id": "8b6d2a8b-4b44-4fd6-8a7e-771c7fbc03b6",
      "name": "Juan Perez",
      "email": "juan@example.com",
      "rol": "USER",
      "isActive": true,
      "createdAt": "2026-07-17T15:30:00.000Z",
      "updatedAt": "2026-07-17T15:30:00.000Z"
    }
  ]
}
```

#### Errores

| Estado | Causa |
| --- | --- |
| `401` | Token no proporcionado, invalido o expirado |
| `403` | Usuario autenticado sin rol `ADMIN` |
| `429` | Demasiadas solicitudes |

### POST `/api/users`

Crea un usuario desde una cuenta administradora.

#### Body

```json
{
  "name": "Admin Creado",
  "email": "admin.creado@example.com",
  "password": "Abc1234!",
  "rol": "ADMIN"
}
```

`rol` es opcional. Si no se envia, se usa `USER`.

#### Respuesta `201`

```json
{
  "datos": {
    "id": "8b6d2a8b-4b44-4fd6-8a7e-771c7fbc03b6",
    "name": "Admin Creado",
    "email": "admin.creado@example.com",
    "rol": "ADMIN",
    "isActive": true,
    "createdAt": "2026-07-17T15:30:00.000Z",
    "updatedAt": "2026-07-17T15:30:00.000Z"
  }
}
```

#### Errores

| Estado | Causa |
| --- | --- |
| `400` | Body invalido, campos faltantes, password debil o campos extra |
| `401` | Token no proporcionado, invalido o expirado |
| `403` | Usuario autenticado sin rol `ADMIN` |
| `409` | Email ya registrado |
| `429` | Demasiadas solicitudes |

### GET `/api/users/:id`

Obtiene un usuario por ID.

#### Parametros

| Parametro | Tipo | Descripcion |
| --- | --- | --- |
| `id` | UUID | ID del usuario |

#### Respuesta `200`

```json
{
  "datos": {
    "id": "8b6d2a8b-4b44-4fd6-8a7e-771c7fbc03b6",
    "name": "Juan Perez",
    "email": "juan@example.com",
    "rol": "USER",
    "isActive": true,
    "createdAt": "2026-07-17T15:30:00.000Z",
    "updatedAt": "2026-07-17T15:30:00.000Z"
  }
}
```

#### Errores

| Estado | Causa |
| --- | --- |
| `400` | `id` no es un UUID valido |
| `401` | Token no proporcionado, invalido o expirado |
| `403` | Usuario autenticado sin rol `ADMIN` |
| `404` | Usuario no encontrado |
| `429` | Demasiadas solicitudes |

### PATCH `/api/users/:id`

Actualiza parcialmente un usuario. Debe enviarse al menos un campo.

#### Parametros

| Parametro | Tipo | Descripcion |
| --- | --- | --- |
| `id` | UUID | ID del usuario |

#### Body

```json
{
  "name": "Nombre Actualizado",
  "email": "nuevo.email@example.com",
  "password": "Nueva123!",
  "rol": "ADMIN",
  "isActive": true
}
```

Todos los campos son opcionales, pero el body no puede estar vacio.

#### Respuesta `200`

```json
{
  "datos": {
    "id": "8b6d2a8b-4b44-4fd6-8a7e-771c7fbc03b6",
    "name": "Nombre Actualizado",
    "email": "nuevo.email@example.com",
    "rol": "ADMIN",
    "isActive": true,
    "createdAt": "2026-07-17T15:30:00.000Z",
    "updatedAt": "2026-07-17T15:35:00.000Z"
  }
}
```

#### Errores

| Estado | Causa |
| --- | --- |
| `400` | `id` invalido, body vacio o datos invalidos |
| `401` | Token no proporcionado, invalido o expirado |
| `403` | Usuario autenticado sin rol `ADMIN` |
| `404` | Usuario no encontrado |
| `409` | Email ya registrado por otro usuario |
| `429` | Demasiadas solicitudes |

### DELETE `/api/users/:id`

Elimina un usuario existente y devuelve sus datos sin `password`.

#### Parametros

| Parametro | Tipo | Descripcion |
| --- | --- | --- |
| `id` | UUID | ID del usuario |

#### Respuesta `200`

```json
{
  "datos": {
    "id": "8b6d2a8b-4b44-4fd6-8a7e-771c7fbc03b6",
    "name": "Juan Perez",
    "email": "juan@example.com",
    "rol": "USER",
    "isActive": true,
    "createdAt": "2026-07-17T15:30:00.000Z",
    "updatedAt": "2026-07-17T15:30:00.000Z"
  }
}
```

#### Errores

| Estado | Causa |
| --- | --- |
| `400` | `id` no es un UUID valido |
| `401` | Token no proporcionado, invalido o expirado |
| `403` | Usuario autenticado sin rol `ADMIN` |
| `404` | Usuario no encontrado |
| `429` | Demasiadas solicitudes |

## Rate limiting

- Rutas `/api/*`: maximo 200 solicitudes cada 15 minutos.
- Rutas `/api/auth/register` y `/api/auth/login`: maximo 10 solicitudes cada 15 minutos.

Respuesta:

```json
{
  "error": {
    "mensaje": "Demasiadas solicitudes. Intentalo mas tarde."
  }
}
```

## Codigos de estado

| Estado | Significado |
| --- | --- |
| `200` | Operacion exitosa |
| `201` | Recurso creado |
| `400` | Datos de entrada invalidos |
| `401` | No autenticado |
| `403` | Sin permisos suficientes |
| `404` | Recurso no encontrado |
| `409` | Conflicto con el estado actual del recurso |
| `429` | Demasiadas solicitudes |
| `500` | Error interno del servidor |

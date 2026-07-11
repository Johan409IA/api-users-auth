# Users API

API REST de usuarios construida con **Node.js**, **Express** y **TypeScript**, siguiendo buenas prácticas de arquitectura por capas, validación, manejo centralizado de errores, logging estructurado y despliegue en **Render**.

---

# Objetivo del proyecto

Este proyecto busca servir como una base sólida para construir una API REST **mantenible**, **legible** y **escalable**, evitando mezclar responsabilidades y preparando el backend desde el inicio para crecer de forma ordenada.

---

# Stack tecnológico

- Node.js
- Express
- TypeScript
- pnpm
- Biome (linting + formatting)
- PostgreSQL
- Prisma ORM
- Zod
- JWT
- bcrypt
- Pino + pino-http
- Vitest + Supertest
- Render

---

# Funcionalidades

- Registro de usuario
- Login con JWT
- Obtener perfil autenticado
- Listar usuarios
- Obtener usuario por ID
- Actualizar usuario
- Desactivar usuario
- Roles (`ADMIN` y `USER`)
- Validación de datos
- Manejo centralizado de errores
- Logging estructurado
- Health Check

---

# Alcance de la primera versión

Incluye:

- Autenticación con JWT
- CRUD de usuarios
- Autorización básica por roles
- Arquitectura modular por capas
- Base lista para producción

## Fuera del alcance

- Refresh Tokens
- OAuth
- Recuperación de contraseña
- Verificación por email
- Permisos granulares
- Caché
- Colas
- Microservicios
- Observabilidad avanzada

---

# Arquitectura

El proyecto sigue una arquitectura por capas.

- **Routes:** definen endpoints y middlewares.
- **Controllers:** traducen HTTP a acciones del sistema.
- **Services:** contienen la lógica de negocio.
- **Repositories:** encapsulan el acceso a datos.
- **Schemas:** validan la entrada.
- **Mappers:** transforman entidades internas en respuestas seguras.

## Flujo de una petición

```text
Route
   │
   ▼
Controller
   │
   ▼
Service
   │
   ▼
Repository
   │
   ▼
Database
```

---

# Estructura del proyecto

```text
src/
├── app.ts
├── server.ts
├── config/
│   ├── database.ts
│   ├── env.ts
│   └── logger.ts
├── shared/
│   ├── errors/
│   │   └── app-error.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── error-handler.ts
│   │   ├── not-found.ts
│   │   └── validate.middleware.ts
│   ├── types/
│   │   └── express.d.ts
│   └── utils/
└── modules/
    ├── auth/
    │   ├── auth.controller.ts
    │   ├── auth.routes.ts
    │   ├── auth.schema.ts
    │   └── auth.service.ts
    └── users/
        ├── user.controller.ts
        ├── user.mapper.ts
        ├── user.repository.ts
        ├── user.routes.ts
        ├── user.schema.ts
        └── user.service.ts

prisma/
├── schema.prisma
└── migrations/

tests/
├── helpers/
└── integration/
```

---

# Requisitos

- Node.js 20+
- pnpm
- PostgreSQL

---

# Instalación

```bash
git clone <TU_REPO_URL>

cd <NOMBRE_DEL_REPO>

pnpm install
```

---

# Variables de entorno

Crear un archivo `.env`.

```env
NODE_ENV=development
PORT=3000

DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/users_api?schema=public

JWT_SECRET=super_secret_key
JWT_EXPIRES_IN=1d

CORS_ORIGIN=http://localhost:3000

LOG_LEVEL=info
```

---

# Scripts

```json
{
  "dev": "tsx watch src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "format": "biome format --write .",
  "lint": "biome lint .",
  "lint:fix": "biome lint --write .",
  "check": "biome check .",
  "check:fix": "biome check --write .",
  "test": "vitest run",
  "test:watch": "vitest",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "prisma:deploy": "prisma migrate deploy"
}
```

---

# Primeros pasos

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Generar el cliente de Prisma

```bash
pnpm prisma:generate
```

### 3. Ejecutar migraciones

```bash
pnpm prisma:migrate
```

### 4. Iniciar el servidor

```bash
pnpm dev
```

Probar:

```http
GET /health
```

---

# Modelo de usuario

```prisma
model User {
  id         String   @id @default(uuid())
  name       String
  email      String   @unique
  password   String
  role       UserRole @default(USER)
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

enum UserRole {
  ADMIN
  USER
}
```

---

# Endpoints

## Auth

| Método | Endpoint | Descripción |
|---------|----------|-------------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Obtener usuario autenticado |

## Users

| Método | Endpoint | Descripción |
|---------|----------|-------------|
| GET | `/api/users` | Listar usuarios |
| GET | `/api/users/:id` | Obtener usuario |
| PATCH | `/api/users/:id` | Actualizar usuario |
| DELETE | `/api/users/:id` | Desactivar usuario |

---

# Convenciones

## Controllers

Los controllers únicamente deben:

- Recibir la request.
- Delegar al service.
- Retornar la respuesta HTTP.

No deben contener lógica de negocio.

## Services

Contienen:

- Reglas de negocio.
- Validaciones.
- Permisos.
- Autenticación.
- Coordinación entre repositorios.

## Repositories

Encapsulan Prisma para desacoplar el resto de la aplicación del ORM.

## Seguridad de datos

Nunca devolver el campo `password` en las respuestas.

---

# Validación y errores

La API utiliza **Zod** y un sistema centralizado de errores.

Ejemplo:

```json
{
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": []
}
```

---

# Seguridad

- Helmet
- CORS
- Hash de contraseñas con bcrypt
- JWT
- Validación con Zod
- Variables de entorno

---

# Logging

Se utiliza **Pino**.

Permite:

- Registrar requests.
- Detectar errores.
- Monitorear la aplicación en producción.

---

# Testing

Se utiliza:

- Vitest
- Supertest

Casos recomendados:

- Registro exitoso
- Login exitoso
- Email duplicado
- Credenciales inválidas
- Acceso sin token
- Actualización de perfil

Ejecutar:

```bash
pnpm test
```

---

# Calidad de código

Se utiliza **Biome**.

Verificar:

```bash
pnpm check
```

Formatear:

```bash
pnpm format
```

---

# Despliegue en Render

## Build Command

```bash
corepack enable && pnpm install --frozen-lockfile && pnpm prisma generate && pnpm build
```

## Start Command

```bash
pnpm prisma:deploy && pnpm start
```

### Variables de producción

```env
NODE_ENV=production
DATABASE_URL=...

JWT_SECRET=...
JWT_EXPIRES_IN=1d

LOG_LEVEL=info
```

---

# Producción

- Usar `process.env.PORT`.
- Ejecutar `prisma migrate deploy`.
- Nunca subir `.env`.
- Sí subir `pnpm-lock.yaml`.

---

# Roadmap

### Día 1

- Setup
- TypeScript
- Express
- Biome

### Día 2

- PostgreSQL
- Prisma
- Migraciones

### Día 3

- Módulo Users

### Día 4

- Módulo Auth

### Día 5

- Validaciones
- Seguridad
- Logging

### Día 6

- Testing

### Día 7

- Documentación
- Deploy

---

# Mejoras futuras

- Refresh Tokens
- Recuperación de contraseña
- Verificación por email
- Rate Limiting
- CI/CD
- OpenAPI / Swagger
- Observabilidad
- Seed de administrador

---

# Filosofía

Este proyecto prioriza:

- Claridad antes que complejidad.
- Modularidad.
- Separación de responsabilidades.
- Escalabilidad.
- Buenas prácticas de desarrollo backend.

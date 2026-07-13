# AGENTS

## PROYECTO
Este es un proyecto de una API REST de usuarios en el que se aplican buenas practicas como la arquitectura por capas, validación, manejo centralizado de errores y logging estructurado.

## Stack
- **Runtime:** Node.js + TypeScript
- **Framework:** Express 5
- **Validación:** Zod
- **Logging:** Pino (pino-http)
- **Seguridad:** Helmet, CORS
- **Gestor de paquetes:** PNPM
- **Linting/Formateo:** Biome
- **Variables de entorno:** dotenv

## Comandos
- Instalar dependencias: `pnpm install`
- Correr el proyecto: `pnpm dev`
- Build: `pnpm build`
- Iniciar en producción: `pnpm start`
- Test: `pnpm test`
- Formatear: `pnpm format`
- Lint: `pnpm lint`
- Lint con fix: `pnpm lint:fix`
- Chequear errores: `pnpm check`
- Chequear y corregir: `pnpm check:fix`

## Convenciones en el codigo
Aplicar la arquitectura por capas y buenas practicas de desarrollo como la implementacion de patrones de diseño **CUANDO SEA NECESARIO**.
Realizar comentarios en el codigo, pero escribe un comentario únicamente cuando el **"por qué"** no pueda deducirse leyendo el código. Toma en cuenta esto:
- 🟢 No comentar operaciones obvias (if, for, return, llamadas a servicios).
- 🟢 Comentar reglas de negocio.
- 🟢 Comentar decisiones de arquitectura o rendimiento.
- 🟢 Comentar hacks, limitaciones y casos especiales.
- 🟢 Comentar cualquier línea que me haga pensar: "Seguro que dentro de unos meses no recordaré por qué hice esto."
Las funciones, clases, variables, etc deben estar en español.
Los nombres de los ficheros y directorios pueden estar en ingles.

## Seguridad y limites
No toques esto sin mi confirmacion
- Borrar archivos
- Consultar variables de entorno o datos secretos
- Migraciones grandes
- Modificar alguna regla de negocio o estructura

## Herramientas
- Usa la CLI de context7 para que busques documentacion actualizada y moderna para que se aplique buenas practicas en el codigo. Usa la skill de `find-docs` que esta a nivel de usuario global para que obtengas documentación oficial y actualizada de tecnologías de desarrollo. Y consulta el `AGENTS.md` que tienes en tu configuracion en `C:\Users\Johan Castillon\.commandcode` para que sepas como usar las herramientas disponibles.
- Usa estos ejemplos de busqueda con el comando `ctx7`:
  - ctx7 library react "How to clean up useEffect with async operations"
  - ctx7 library nextjs "How to set up app router with middleware"
  - ctx7 library prisma "How to define one-to-many relations with cascade delete"
- No uses `npx ctx7` para buscar documentacion, por ejemplo: `npx ctx7@latest docs /prisma/prisma/7.5.0 "prisma-client driver adapter pg postgresql"]`, usa `ctx7` directamente en la terminal, asi evitas errores.
- Si por algun motivo no llegas a encontrar la informacion que necesitas, consulta la documentacion oficial de la tecnologia que estés utilizando, por ejemplo si es express.js, consulta la documentacion oficial de express.js [https://expressjs.com/](Express.js)

## REGLAS GENERALES
- Revisa primero el AGENTS.md para que tengas contexto del proyecto y sepas de sus reglas.
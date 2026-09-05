# VocaPath-backend

API REST para VocaPath: registro/login de usuarios, catálogo de universidades y carreras, fechas del proceso PAES, prueba tipo PAES, test vocacional, puntajes, favoritas, comparador y simulador de postulación.

## Tecnologías

- **NestJS 12** (arquitectura de monolito modular, ESM)
- **TypeScript**
- **PostgreSQL** + **Drizzle ORM** (`drizzle-kit` para migraciones)
- **Passport** (`passport-local` para login, `passport-jwt` para rutas protegidas) + **bcrypt** para el hash de contraseñas
- **JWT**: access token de vida corta (Authorization header) + refresh token de vida larga (cookie httpOnly, con rotación y revocación en logout)
- **class-validator** / **class-transformer** para validar los DTOs de entrada
- **Docker Compose** para levantar Postgres en desarrollo
- **Vitest** + `@vue/test-utils`-style testing utilities de Nest (`@nestjs/testing`) para los tests

## Requisitos

- [Node.js](https://nodejs.org/) 20 o superior
- [pnpm](https://pnpm.io/) como gestor de paquetes
- [Docker](https://www.docker.com/) (Docker Desktop en Windows/Mac) para levantar Postgres localmente

## Puesta en marcha

```bash
pnpm install                      # instalar dependencias
cp .env.example .env              # crear el archivo de entorno local
docker compose up -d              # levantar Postgres en localhost:5432
pnpm run db:migrate                # aplicar las migraciones
pnpm run db:seed                   # cargar datos de ejemplo (universidades, carreras, preguntas, fechas)
pnpm run start:dev                 # servidor de desarrollo con watch (http://localhost:3000)
```

Edita `.env` si necesitas cambiar algún valor (por ejemplo, generar un `JWT_SECRET` propio en vez del de ejemplo).

## Variables de entorno

| Variable | Descripción | Valor de ejemplo |
|---|---|---|
| `DATABASE_URL` | Cadena de conexión a Postgres | `postgresql://vocapath:vocapath@localhost:5432/vocapath` |
| `PORT` | Puerto donde escucha la API | `3000` |
| `FRONTEND_URL` | Origen permitido por CORS (con credenciales) | `http://localhost:5173` |
| `JWT_SECRET` | Secreto para firmar los access tokens | *(definir uno propio, no usar el de ejemplo)* |
| `JWT_ACCESS_EXPIRES_IN` | Duración del access token | `15m` |
| `REFRESH_TOKEN_EXPIRES_IN_DAYS` | Duración del refresh token, en días | `7` |

Las credenciales de `docker-compose.yml` (usuario/clave/base `vocapath`) ya coinciden con el `DATABASE_URL` de `.env.example`.

## Scripts disponibles

```bash
pnpm run start          # levantar la app
pnpm run start:dev      # levantar la app con watch (recomendado en desarrollo)
pnpm run build          # compilar a dist/
pnpm run lint           # linter (oxlint)
pnpm run test           # tests unitarios (Vitest)
pnpm run test:e2e       # tests end-to-end (Vitest)

pnpm run db:generate    # generar una migración a partir de cambios en src/database/schema
pnpm run db:migrate     # aplicar las migraciones pendientes contra DATABASE_URL
pnpm run db:seed        # cargar datos de ejemplo (idempotente, se puede correr varias veces)
pnpm run db:studio      # abrir Drizzle Studio para explorar la base de datos
```

## Estructura del proyecto

```
src/
├── auth/              # registro, login, refresh, logout, guards y estrategias de Passport
├── users/             # acceso a la tabla de usuarios
├── database/           # schema de Drizzle, migraciones y script de seed
├── universities/       # listado y detalle de universidades
├── careers/            # listado, búsqueda, detalle y comparador de carreras
├── favorites/          # carreras favoritas por usuario
├── paes-dates/         # fechas del proceso PAES
├── paes-tests/         # banco de preguntas y rendición de la prueba tipo PAES
├── scores/             # "Mis Puntajes" (ingreso manual, eliminación)
├── vocational-tests/   # test vocacional y recomendación de carreras
└── simulator/           # simulador de postulación
```

## Base de datos

El modelo se define con Drizzle en `src/database/schema/` y las migraciones generadas viven en `src/database/migrations/`. Todas las tablas de contenido (universidades, carreras, fechas, banco de preguntas) tienen una restricción `unique` que hace que `pnpm run db:seed` sea seguro de ejecutar más de una vez sin duplicar datos.

El seed actual carga datos de ejemplo curados a mano (no scrapeados); el scraping real de sitios universitarios y del DEMRE está pendiente para una siguiente etapa.

# 🐳 Cómo levantar proCard con Docker

Esta guía explica cómo construir y ejecutar **proCard** dentro de Docker. El
mismo contenedor compila la aplicación y **el servidor de Next.js sirve tanto el
frontend como el backend** (las rutas `/api/*`). No necesitas instalar Node ni
Prisma en tu máquina, solo Docker.

---

## 1. Requisitos

- **Docker** 20+ y **Docker Compose v2** (`docker compose`, no `docker-compose`).
- Puerto libre en el host (por defecto el `3000`).

Comprueba que tienes todo:

```bash
docker version
docker compose version
```

---

## 2. Configurar las variables de entorno

Copia la plantilla a un archivo `.env` en la raíz del proyecto (junto a
`docker-compose.yml`). Compose lo lee automáticamente.

**Linux / macOS:**
```bash
cp .env.docker.example .env
```

**Windows (PowerShell):**
```powershell
Copy-Item .env.docker.example .env
```

Edita `.env` y, como mínimo, define un **`AUTH_SECRET`** seguro:

```bash
# Linux / macOS
openssl rand -hex 32
```
```powershell
# Windows (PowerShell)
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })
```

Pega el resultado en `AUTH_SECRET=...`.

Variables disponibles:

| Variable             | Obligatoria | Descripción                                                                 |
|----------------------|:-----------:|-----------------------------------------------------------------------------|
| `AUTH_SECRET`        | ✅          | Secreto para firmar las sesiones de NextAuth.                               |
| `PORT`               | ❌          | Puerto del host (por defecto `3000`). Cámbialo si está ocupado.             |
| `RUN_SEED`           | ❌          | `true` para cargar datos de ejemplo la **primera vez**. Luego ponlo `false`.|
| `AUTH_GOOGLE_ID`     | ❌          | Client ID de Google OAuth (solo si quieres login con Google).              |
| `AUTH_GOOGLE_SECRET` | ❌          | Client Secret de Google OAuth.                                              |
| `NEXT_PUBLIC_API_URL`| ❌          | Déjalo **vacío**: el front usa el backend del propio contenedor.            |

> 💡 El login por **email + contraseña** funciona sin configurar Google.

---

## 3. Levantar la aplicación

Desde la raíz del proyecto:

```bash
docker compose up -d --build
```

Esto:
1. Construye la imagen (instala dependencias, genera el cliente de Prisma y
   ejecuta `next build`).
2. Crea los volúmenes persistentes para la base de datos y los archivos subidos.
3. Al arrancar, **sincroniza el esquema de la base de datos** y, si
   `RUN_SEED=true`, carga los datos de ejemplo.
4. Inicia el servidor de Next.js.

Cuando termine, abre 👉 **http://localhost:3000** (o el `PORT` que definiste).

Ver los logs en vivo:
```bash
docker compose logs -f
```

Deberías ver al final:
```
==> proCard: iniciando servidor Next.js en el puerto 3000...
▲ Next.js 16.1.1
✓ Ready
```

---

## 4. Comandos útiles del día a día

```bash
# Detener (sin borrar datos)
docker compose down

# Volver a arrancar
docker compose up -d

# Reconstruir tras cambios en el código
docker compose up -d --build

# Ver logs
docker compose logs -f

# Entrar a una shell dentro del contenedor
docker compose exec app sh
```

---

## 5. Persistencia de datos

Los datos viven en **volúmenes Docker** (no se pierden al reiniciar/recrear el
contenedor):

| Volumen            | Ruta en el contenedor | Contenido                          |
|--------------------|-----------------------|------------------------------------|
| `procard-db`       | `/app/db`             | Base de datos SQLite (`dev.db`).   |
| `procard-uploads`  | `/app/public/uploads` | Imágenes y archivos subidos.       |

Comprobar los volúmenes:
```bash
docker volume ls | grep procard
```

⚠️ **Para empezar de cero (borra TODOS los datos):**
```bash
docker compose down -v
```

---

## 6. Cargar / recargar datos de ejemplo (seed)

El seed se ejecuta automáticamente al arrancar **solo si `RUN_SEED=true`**.

Para ejecutarlo manualmente sin recrear el contenedor:
```bash
docker compose exec app npx prisma db seed
```
> El seed **borra** los perfiles y usuarios existentes y los vuelve a crear.
> Crea, entre otros, el usuario demo `cristian.puma.es6@gmail.com` con
> contraseña `123456`.

---

## 7. Inspeccionar la base de datos

```bash
# Abrir Prisma Studio dentro del contenedor (puerto 5555)
docker compose exec app npx prisma studio
```
O copia el archivo `.db` a tu máquina:
```bash
docker compose cp app:/app/db/dev.db ./dev.db
```

---

## 8. Solución de problemas

| Problema                                   | Causa / Solución                                                                 |
|--------------------------------------------|----------------------------------------------------------------------------------|
| `bind: address already in use`             | El `PORT` está ocupado. Cambia `PORT` en `.env` (ej. `PORT=3001`).               |
| `AUTH_SECRET ... must be set`              | No definiste `AUTH_SECRET` en `.env`.                                            |
| La API devuelve `[]` / no hay perfiles     | Aún no has sembrado datos. Pon `RUN_SEED=true` o ejecuta el seed manual (§6).    |
| Quiero reiniciar la BD desde cero          | `docker compose down -v` y vuelve a levantar.                                    |
| Login con Google no funciona               | Define `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` y registra la URL de callback.    |

---

## 9. Notas técnicas

- **Base de datos:** SQLite. La ruta se controla con `DATABASE_URL`
  (`file:/app/db/dev.db` en Docker). En el contenedor se usa
  `prisma db push` en vez de `migrate deploy` porque las migraciones del
  repositorio están desactualizadas respecto a `schema.prisma`; `db push` deja
  la BD idéntica al esquema actual (ver [`COMO-FUNCIONA.md`](COMO-FUNCIONA.md)).
- **Build de producción:** se genera durante `docker build` (`next build`) y se
  sirve con `next start`. El frontend y el backend son el **mismo proceso**.
- **Imagen base:** `node:20-slim` (Debian) con `openssl`, requerido por los
  engines de Prisma.

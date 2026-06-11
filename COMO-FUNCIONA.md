# 📘 Cómo funciona proCard

**proCard** es una aplicación web para crear y mostrar **tarjetas / vitrinas
profesionales** (perfiles tipo CV: experiencia, proyectos, educación,
certificaciones, skills, etc.). Cada perfil se puede ver como una vitrina
pública y exportar como CV imprimible.

Está construida como una aplicación **full‑stack monolítica con Next.js**: el
mismo servidor renderiza el frontend y expone el backend (API + Server Actions).

---

## 1. Stack tecnológico

| Capa            | Tecnología                                   |
|-----------------|----------------------------------------------|
| Framework       | **Next.js 16** (App Router) + **React 19**   |
| Lenguaje        | **TypeScript**                               |
| Estilos         | **Tailwind CSS v4** + componentes propios    |
| Animaciones     | **Framer Motion**                            |
| ORM / BD        | **Prisma 5** sobre **SQLite**                |
| Autenticación   | **NextAuth v5** (Google OAuth + credenciales)|
| Validación      | **Zod**                                      |
| Iconos          | **lucide-react**, **react-icons**            |

---

## 2. Arquitectura general

```
                  ┌──────────────────────────────────────────┐
   Navegador ───▶ │              SERVIDOR NEXT.JS              │
   (React)        │                                            │
                  │  Frontend (RSC + Client Components)         │
                  │      app/page.tsx, app/showcase, app/cv...  │
                  │                                            │
                  │  Backend                                   │
                  │   ├─ Route Handlers   (app/api/*)           │
                  │   ├─ Server Actions   (lib/actions.ts)      │
                  │   └─ Auth             (lib/auth.ts)         │
                  │                  │                          │
                  │            Prisma Client                    │
                  └──────────────────┼──────────────────────────┘
                                     ▼
                            SQLite (prisma/dev.db)
```

**Clave:** no hay un backend separado. El frontend y el backend son **el mismo
proceso de Next.js**. Por eso, al dockerizar, basta un único contenedor que
sirve todo.

---

## 3. Estructura del proyecto

```
proCard/
├── app/                      # App Router (rutas = carpetas)
│   ├── page.tsx              # Home: vitrina de perfiles + selector de rol
│   ├── layout.tsx            # Layout raíz (providers, fuentes, navbar/footer)
│   ├── login/                # Página de inicio de sesión
│   ├── register/             # Página de registro
│   ├── showcase/
│   │   ├── page.tsx          # Listado de vitrinas
│   │   └── [id]/             # Vitrina pública de un perfil
│   ├── cv/[id]/              # Vista de CV imprimible de un perfil
│   └── api/                  # BACKEND (Route Handlers)
│       ├── auth/[...nextauth]/route.ts   # Endpoints de NextAuth
│       ├── profiles/route.ts             # GET (listar) / POST (crear) perfiles
│       ├── profiles/[id]/route.ts        # GET / PUT / DELETE de un perfil
│       └── ...
│   └── uploads/[filename]/route.ts       # Sirve archivos subidos desde disco
│
├── components/               # Componentes de UI
│   ├── sections/             # Secciones de página (hero, proyectos, vitrinas…)
│   ├── ui/                   # Botones, tarjetas, toasts, iconos…
│   ├── layout/               # Navbar y footer
│   └── *Modal.tsx            # Modales para crear / editar perfiles
│
├── lib/                      # Lógica de servidor y utilidades
│   ├── actions.ts            # Server Actions (CRUD de perfiles + uploads)
│   ├── api.ts                # Cliente fetch usado por el frontend
│   ├── auth.ts               # Configuración de NextAuth (providers)
│   ├── auth.config.ts        # Callbacks y reglas de autorización (middleware)
│   ├── db.ts                 # Instancia singleton de PrismaClient
│   └── utils.ts              # Helpers varios
│
├── data/                     # Datos estáticos / constantes de perfiles
├── prisma/
│   ├── schema.prisma         # Modelo de datos (fuente de verdad)
│   ├── migrations/           # Migraciones (⚠️ desactualizadas, ver §7)
│   └── seed.ts               # Datos de ejemplo
├── public/uploads/           # Imágenes subidas (servidas vía route handler)
├── middleware.ts             # Protege rutas con NextAuth
├── next.config.ts            # Configuración de Next.js
│
├── Dockerfile                # Imagen de producción
├── docker-compose.yml        # Orquestación + volúmenes
├── docker-entrypoint.sh      # Migra/sincroniza BD y arranca el server
└── DOCKER.md                 # Guía para levantar con Docker
```

---

## 4. Flujo de datos

### Lectura (mostrar perfiles)
1. Un componente del frontend (ej. `app/page.tsx`) llama a
   `getClientShowcaseProfiles()` de [`lib/api.ts`](lib/api.ts).
2. Ese helper hace `fetch('/api/profiles')` contra el **mismo servidor**.
3. El route handler [`app/api/profiles/route.ts`](app/api/profiles/route.ts)
   ejecuta `getShowcaseProfiles()` de [`lib/actions.ts`](lib/actions.ts).
4. `actions.ts` consulta la BD con **Prisma** y devuelve JSON.

> `lib/api.ts` admite un `NEXT_PUBLIC_API_URL` opcional para escenarios donde el
> front se aloja aparte (ej. GitHub Pages estático). En Docker se deja vacío y
> todo va por rutas relativas al propio backend.

### Escritura (crear / editar perfil)
- Los modales (`CreateProfileModal`, `EditProfileModal`) envían un `FormData`
  (incluye imágenes) a `POST/PUT /api/profiles`.
- El backend procesa el formulario en `lib/actions.ts`, guarda las imágenes en
  `public/uploads/` y persiste los datos con Prisma.

### Subida y servido de archivos
- Al subir una imagen, se escribe en `public/uploads/<archivo>` y se guarda la
  URL `/uploads/<archivo>` en la BD.
- [`app/uploads/[filename]/route.ts`](app/uploads/[filename]/route.ts) **lee el
  archivo desde disco** y lo devuelve. Esto evita el problema de que Next.js no
  detecte archivos creados *después* del build (los assets estáticos se fijan en
  tiempo de build).

---

## 5. Autenticación

- Gestionada por **NextAuth v5** ([`lib/auth.ts`](lib/auth.ts)).
- Dos formas de login:
  - **Credenciales** (email + contraseña, con `bcryptjs`).
  - **Google OAuth** (opcional, requiere `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`).
- Sesiones en modo **JWT** (`strategy: "jwt"`), firmadas con `AUTH_SECRET`.
- [`middleware.ts`](middleware.ts) + [`lib/auth.config.ts`](lib/auth.config.ts)
  protegen rutas: las páginas bajo `/dashboard` y la API `/api/profiles`
  requieren sesión; usuarios logueados son redirigidos fuera de `/login` y
  `/register`.

---

## 6. Modelo de datos (Prisma)

Definido en [`prisma/schema.prisma`](prisma/schema.prisma). Entidad central:
**`Profile`**, con relaciones a:

- `WorkExperience` → `WorkImage` (experiencia laboral con imágenes)
- `Experience` → `ExperienceHighlight`
- `Project` → `ProjectImage`, `ProjectTag`
- `SkillCategory` → `SkillItem`
- `Education`, `Certification`, `Attribute`, `Social`

Para la autenticación: `User`, `Account`, `Session`, `VerificationToken`
(adaptador de NextAuth). Un `User` puede tener varios `Profile`.

`SearchLog` registra búsquedas.

La base de datos es **SQLite** (un único archivo `dev.db`). La ruta se controla
con la variable `DATABASE_URL`:
- Local: `file:./dev.db` → `prisma/dev.db`
- Docker: `file:/app/db/dev.db` → volumen persistente

---

## 7. ⚠️ Nota importante sobre las migraciones

Al verificar el proyecto se detectó que **las migraciones en `prisma/migrations/`
están desactualizadas** respecto a `schema.prisma`. Por ejemplo, columnas como
`Profile.slug`, `Profile.userId`, los modelos `WorkExperience`, `WorkImage`,
`ProjectImage`, y varios campos (`url`, `logoUrl`, `order`, …) existen en el
esquema pero **no** en las migraciones.

Consecuencia: ejecutar `prisma migrate deploy` crea una BD incompleta y la app
falla (`The column 'slug' does not exist`). El proyecto se sincroniza realmente
con **`prisma db push`** (que aplica el esquema directamente), por eso funciona
en local pero no con migraciones.

**Cómo lo resolvemos:** el contenedor Docker usa `prisma db push` en el arranque
([`docker-entrypoint.sh`](docker-entrypoint.sh)), dejando la BD idéntica a
`schema.prisma` — que es lo que el Prisma Client espera.

**Recomendación a futuro** (opcional, fuera del alcance de Docker): regenerar el
historial de migraciones para que coincida con el esquema:

```bash
# ⚠️ Reinicia el historial de migraciones (hazlo en un entorno controlado)
rm -rf prisma/migrations
npx prisma migrate dev --name init
```

---

## 8. Cómo ejecutar el proyecto

### Opción A — Docker (recomendada)
Ver la guía completa en [`DOCKER.md`](DOCKER.md). En resumen:
```bash
cp .env.docker.example .env   # define AUTH_SECRET; RUN_SEED=true la 1ª vez
docker compose up -d --build
# → http://localhost:3000
```

### Opción B — Local (sin Docker)
```bash
npm install                   # instala deps (el postinstall genera Prisma)
npx prisma db push            # crea/sincroniza prisma/dev.db
npx prisma db seed            # (opcional) datos de ejemplo
npm run dev                   # desarrollo (lee el PORT del .env)
# o para producción:
npm run build && npm run prod
```
Necesitas un archivo `.env` con al menos `DATABASE_URL="file:./dev.db"` y
`AUTH_SECRET`. Usa el archivo `env` del repo como referencia de variables.

---

## 9. Scripts de npm

| Script          | Acción                                                        |
|-----------------|---------------------------------------------------------------|
| `npm run dev`   | Servidor de desarrollo (`run-dev.js` → `next dev`).           |
| `npm run build` | Compila el build de producción (`next build`).                |
| `npm run prod`  | Servidor de producción (`run-prod.js` → `next start`).        |
| `npm start`     | `next start` directo.                                         |
| `npm run lint`  | ESLint.                                                       |
| `postinstall`   | `prisma generate` (se ejecuta tras `npm install`).            |
| `prisma db seed`| Carga datos de ejemplo (`prisma/seed.ts`, vía `tsx`).         |

---

## 10. Usuario de ejemplo (tras el seed)

| Email                          | Contraseña |
|--------------------------------|------------|
| `cristian.puma.es6@gmail.com`  | `123456`   |

> El seed **borra** los perfiles/usuarios previos y recrea los de ejemplo.

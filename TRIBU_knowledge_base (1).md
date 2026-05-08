# TRIBU — Knowledge Base Completa para Agente de IA

> Este documento contiene toda la información del proyecto TRIBU: contexto, modelo de negocio, arquitectura técnica, stack, buenas prácticas y el prompt de construcción del MVP. Está diseñado para ser consumido directamente por un agente de IA como contexto de trabajo.

---

## 1. CONTEXTO Y PROBLEMA

**TRIBU** es una plataforma SaaS de gestión estratégica de talento voluntario para ONGs (Organizaciones No Gubernamentales / ASFLs).

### El problema que resuelve
Las ONGs en República Dominicana (y Latinoamérica) gestionan sus voluntarios con hojas de Excel, listas en papel y WhatsApp. Esto genera:
- Alta rotación de voluntarios (el problema principal)
- Imposibilidad de medir el impacto social de forma auditable
- Incapacidad de hacer matchmaking entre habilidades y misiones
- Falta de incentivos para que el voluntario regrese

### La propuesta de valor
- **Para la ONG:** Menos administración, más ejecución. Reducción en costos de reclutamiento.
- **Para el voluntario:** Validación de habilidades con valor real en el mercado laboral. Construye su CV mientras ayuda.
- **Para el ecosistema:** El impacto social deja de ser una estimación y se convierte en una estadística real y auditable.

---

## 2. MODELO DE NEGOCIO

### Segmentos de clientes

**B2B (pagan):**
- ONGs / ASFLs que necesitan reducir rotación y automatizar administración
- Empresas con programas de RSC que necesitan datos reales para reportes de sostenibilidad (ESG)

**B2C (usuarios clave — el corazón del sistema):**
- Voluntarios activos: estudiantes universitarios y jóvenes profesionales en RD
- Early adopters: estudiantes de término que necesitan completar horas de labor social obligatoria

### Fuentes de ingresos
1. **Suscripción SaaS (freemium):** Las ONGs pagan mensualidad por el dashboard
2. **IaaS — Impact as a Service:** Empresas pagan por reportes certificados de impacto ESG generados automáticamente con los datos de voluntarios

### Aliados estratégicos
- **MEPyD (Ministerio de Economía):** Para ser herramienta estándar de validación de impacto social
- **Universidades:** Para que horas en TRIBU cuenten como créditos de labor social obligatoria
- **Cloud providers:** Azure / AWS para escalabilidad

---

## 3. LOS 3 PILARES DE LA PLATAFORMA

### Pilar A — Gestión de Talento (SaaS)
- Dashboard para coordinar actividades
- Captación de voluntarios con perfilado por habilidades técnicas
- Validación de asistencia mediante QR Dinámicos
- Matchmaking: si una ONG necesita un diseñador, TRIBU le envía ese perfil específico

### Pilar B — Retención y Fidelización
- Certificados de Competencias (soft skills) validados por IA
- Cada voluntario acumula horas que se traducen en certificados
- El voluntario construye su CV mientras impacta al mundo

### Pilar C — Profesionalización del Impacto
- Reportes automáticos de impacto social bajo estándares ESG
- Permite a las ONGs hablar el lenguaje de donantes corporativos
- Datos auditables sobre retorno social de cada peso invertido

---

## 4. EQUIPO

| Nombre | Rol | Contacto |
|--------|-----|----------|
| Channel Feliz de Oleo | Líder de Proyecto + Finanzas | channel.oleo@gmail.com / 809-420-2288 |
| Candy Hiraldo Quispe | Comunicación e Impacto | Candynoemihq@gmail.com / 829-343-4992 |
| Gabriel Caraballo Roa | Responsable de Operaciones y Producto | Gabrielcaraballo228@gmail.com / 809-212-9704 |
| Esthel Laoz | Investigación y Datos (IA/BERT) | esthellahoz8@gmail.com / 849-224-8908 |

---

## 5. PLAN OPERATIVO 30/60/90 DÍAS

### Horizonte 1 (días 1–30): Validar
- Meta: 10 ONGs validadas, 3 empresas prospectadas
- Actividades: entrevistas con directores de ONGs, mapeo de flujos de datos, definición de requisitos técnicos del dashboard

### Horizonte 2 (días 31–60): Construir MVP
- Meta: MVP v1.0 funcional con 5 ONGs piloto y 50 voluntarios
- KPI: +95% de asistencia registrada vía QR en las 5 ONGs piloto
- Actividades: dashboard con métricas LTV, sistema QR dinámico, entrenamiento modelo BERT para matchmaking

### Horizonte 3 (días 61–90): Consolidar
- Meta: infraestructura IaaS operativa, +20% intención de retención detectada
- Actividades: formalización legal (ONAPI), primer reporte ESG con datos reales, integración de Certificados de Competencias, campaña de preventa B2B

---

## 6. PRESUPUESTO MVP (Fase 1 — 6 meses)

| Recurso | Tipo | Costo mensual (DOP) | Total 6 meses |
|---------|------|---------------------|---------------|
| Desarrollador Full-Stack | RRHH | 45,000 | 270,000 |
| Diseñador UX/UI | RRHH | 25,000 | 150,000 |
| Marketing Digital / Captación ONGs | RRHH | 5,000 | 30,000 |
| Gestor del proyecto | RRHH | 35,000 | 210,000 |
| Dominio web | Tecnológico | — | 500 |
| Firebase / Google Cloud | Tecnológico | 1,500 | 9,000 |
| API Google Maps / NLP (BERT) | Tecnológico | 2,500 | 15,000 |
| Plan de internet | Operativo | 1,500 | 9,000 |
| Energía eléctrica | Operativo | 2,000 | 12,000 |
| Laptop/Tablet/Celular | Tecnológico | — | 30,000 |
| Registro de Marca (ONAPI) | Legal | — | 10,000 |
| Constitución de Empresa | Legal | — | 50,000 |
| **TOTAL** | | | **807,500 DOP** |

---

## 7. ARQUITECTURA TÉCNICA DEL MVP

### Principios de arquitectura
- **Mobile-first:** Los voluntarios usan el sistema desde el celular en campo
- **Offline-capable para QR:** El escaneo de QR debe funcionar aunque la señal sea mala
- **Real-time:** La asistencia debe reflejarse inmediatamente en el dashboard de la ONG
- **Multi-tenant:** Múltiples ONGs en la misma instancia, datos completamente aislados
- **Escalable horizontalmente:** Empezar simple, crecer sin reescribir

### Stack técnico definido

#### Frontend
- **Framework:** Next.js 14 (App Router)
- **UI:** Tailwind CSS + shadcn/ui
- **Estado global:** Zustand
- **Formularios:** React Hook Form + Zod (validación)
- **QR:** `react-qr-code` (generación) + `html5-qrcode` (escaneo desde cámara)
- **Gráficas:** Recharts

#### Backend
- **Runtime:** Node.js con Next.js API Routes (o Express si se separa)
- **Base de datos:** PostgreSQL (Supabase — incluye auth, storage, real-time)
- **ORM:** Prisma
- **Autenticación:** Supabase Auth (email/password + magic link)
- **Almacenamiento de archivos:** Supabase Storage (fotos de perfil, documentos)
- **Real-time:** Supabase Realtime (para actualización live del dashboard)
- **Jobs/tareas:** pg-cron o Supabase Edge Functions para cálculos de horas

#### Infraestructura
- **Hosting:** Vercel (frontend + API routes)
- **Base de datos:** Supabase (PostgreSQL managed)
- **CDN:** Vercel Edge Network
- **Variables de entorno:** Vercel Environment Variables
- **CI/CD:** GitHub Actions → Vercel deploy automático

#### Herramientas de desarrollo
- **Lenguaje:** TypeScript (estricto, sin `any`)
- **Linter:** ESLint + Prettier
- **Testing:** Vitest (unit) + Playwright (e2e flujos críticos)
- **Repositorio:** Git con ramas `main` / `develop` / `feature/*`

---

## 8. MODELO DE DATOS (ESQUEMA DE BASE DE DATOS)

```
organizations
  - id (uuid, PK)
  - name (text, not null)
  - description (text)
  - logo_url (text)
  - created_at (timestamptz)
  - owner_id (uuid → users.id)

users
  - id (uuid, PK) [sincronizado con Supabase Auth]
  - email (text, unique)
  - full_name (text)
  - role (enum: 'org_admin' | 'volunteer')
  - phone (text)
  - avatar_url (text)
  - created_at (timestamptz)

volunteer_profiles
  - id (uuid, PK)
  - user_id (uuid → users.id, unique)
  - bio (text)
  - skills (text[]) — array de habilidades declaradas
  - university (text)
  - career (text)
  - total_hours (numeric, default 0) — calculado automáticamente
  - created_at (timestamptz)

org_members
  - id (uuid, PK)
  - org_id (uuid → organizations.id)
  - user_id (uuid → users.id)
  - role (enum: 'admin' | 'coordinator')
  - joined_at (timestamptz)

activities
  - id (uuid, PK)
  - org_id (uuid → organizations.id)
  - title (text, not null)
  - description (text)
  - required_skills (text[])
  - location (text)
  - start_time (timestamptz)
  - end_time (timestamptz)
  - max_volunteers (int)
  - status (enum: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled')
  - created_by (uuid → users.id)
  - created_at (timestamptz)

activity_registrations
  - id (uuid, PK)
  - activity_id (uuid → activities.id)
  - volunteer_id (uuid → users.id)
  - status (enum: 'registered' | 'attended' | 'absent' | 'cancelled')
  - registered_at (timestamptz)
  - attended_at (timestamptz, nullable)

qr_tokens
  - id (uuid, PK)
  - activity_id (uuid → activities.id)
  - token (text, unique) — UUID rotativo
  - expires_at (timestamptz) — caduca cada 30 segundos
  - created_at (timestamptz)

attendance_logs
  - id (uuid, PK)
  - activity_id (uuid → activities.id)
  - volunteer_id (uuid → users.id)
  - scanned_at (timestamptz)
  - hours_credited (numeric) — calculado al cerrar actividad
  - verified (boolean, default false)

certificates
  - id (uuid, PK)
  - volunteer_id (uuid → users.id)
  - skill (text)
  - hours_required (numeric)
  - hours_completed (numeric)
  - issued_at (timestamptz, nullable)
  - certificate_url (text, nullable)
  - status (enum: 'in_progress' | 'issued')
```

### Reglas de negocio en la base de datos
- Row Level Security (RLS) activado en todas las tablas en Supabase
- Una ONG solo puede leer/escribir sus propios datos
- Un voluntario solo puede ver sus propios logs y certificados
- Los `qr_tokens` tienen TTL de 30 segundos (se regeneran automáticamente)
- `total_hours` en `volunteer_profiles` se actualiza via trigger al insertar en `attendance_logs`

---

## 9. FLUJOS FUNCIONALES DEL MVP

### Flujo 1: Registro y onboarding
```
Usuario llega → selecciona rol (ONG admin / Voluntario)
  → ONG: crea organización, completa perfil
  → Voluntario: completa perfil, declara habilidades
  → Verificación de email (Supabase Auth)
  → Dashboard según rol
```

### Flujo 2: Creación de actividad (ONG)
```
Admin ONG → "Nueva actividad"
  → Formulario: título, descripción, habilidades requeridas, fecha, lugar, máximo voluntarios
  → Guardar como borrador o publicar directamente
  → Al publicar: visible en feed de voluntarios
```

### Flujo 3: Registro a actividad (Voluntario)
```
Voluntario → "Explorar actividades"
  → Filtra por habilidades, fecha, ONG
  → Ve detalle de actividad
  → Botón "Registrarme" → status: 'registered'
  → Recibe confirmación
```

### Flujo 4: Validación QR (El flujo más crítico)
```
[En el evento]:
Admin ONG → abre actividad → "Iniciar registro de asistencia"
  → Sistema genera QR dinámico (token UUID, caduca cada 30s, se renueva automáticamente)
  → QR se muestra en pantalla del admin

Voluntario → abre app → "Escanear QR"
  → Cámara lee el QR
  → Sistema valida: token vigente + voluntario registrado en actividad
  → Si válido: marca asistencia, muestra confirmación "✓ Asistencia registrada"
  → Si inválido/expirado: muestra error claro

Al cerrar actividad:
  → Admin marca actividad como 'completed'
  → Sistema calcula horas (end_time - start_time) para todos los asistentes
  → Actualiza total_hours en volunteer_profiles
  → Evalúa si algún certificado debe ser emitido
```

### Flujo 5: Dashboard ONG
```
Admin ve:
  → Actividades próximas y activas
  → Voluntarios registrados vs. asistieron (tasa de asistencia)
  → Top voluntarios por horas
  → Habilidades más comunes en su banco de voluntarios
  → Histórico de actividades completadas
```

### Flujo 6: Perfil del voluntario
```
Voluntario ve:
  → Total de horas acumuladas
  → Historial de actividades
  → Habilidades declaradas + horas validadas por skill
  → Certificados obtenidos / en progreso
  → Badge/nivel según horas (Rookie / Activo / Experto)
```

---

## 10. COMPONENTES UI NECESARIOS

### Páginas de autenticación
- `/auth/login` — Login con email/password
- `/auth/register` — Registro con selección de rol
- `/auth/verify` — Verificación de email

### Páginas de ONG (rol: org_admin)
- `/dashboard` — Overview: métricas, actividades próximas
- `/activities` — Listado de actividades de la organización
- `/activities/new` — Crear nueva actividad
- `/activities/[id]` — Detalle: registrados, QR, asistencia en vivo
- `/activities/[id]/qr` — Pantalla dedicada al QR dinámico (para mostrar en pantalla grande)
- `/volunteers` — Banco de voluntarios con filtros por habilidad
- `/reports` — Métricas de impacto (básico para MVP)

### Páginas de voluntario (rol: volunteer)
- `/feed` — Feed de actividades disponibles
- `/feed/[id]` — Detalle de actividad + botón de registro
- `/scan` — Escáner de QR (acceso rápido desde móvil)
- `/profile` — Mi perfil, horas, habilidades
- `/certificates` — Mis certificados y progreso

### Componentes reutilizables clave
- `QRDisplay` — Muestra QR con auto-refresh cada 25s
- `QRScanner` — Usa cámara del dispositivo
- `ActivityCard` — Card de actividad con estado y acciones
- `SkillBadge` — Badge visual por habilidad
- `HoursCounter` — Animado, muestra total de horas
- `AttendanceList` — Lista en tiempo real de quién ya escaneó

---

## 11. APIS / ENDPOINTS NECESARIOS

```
POST   /api/auth/register          — Registro de usuario
POST   /api/auth/login             — Login

GET    /api/organizations          — Mis organizaciones
POST   /api/organizations          — Crear organización
GET    /api/organizations/[id]     — Detalle de organización

GET    /api/activities             — Listar actividades (con filtros)
POST   /api/activities             — Crear actividad
GET    /api/activities/[id]        — Detalle de actividad
PATCH  /api/activities/[id]        — Actualizar actividad
PATCH  /api/activities/[id]/status — Cambiar estado (open/in_progress/completed)

POST   /api/activities/[id]/register   — Registrarse como voluntario
DELETE /api/activities/[id]/register   — Cancelar registro

GET    /api/activities/[id]/qr     — Obtener QR token vigente (genera nuevo si expiró)
POST   /api/activities/[id]/scan   — Escanear QR y registrar asistencia
GET    /api/activities/[id]/attendance — Lista de asistencia en tiempo real

GET    /api/volunteers/profile     — Mi perfil de voluntario
PATCH  /api/volunteers/profile     — Actualizar perfil y habilidades
GET    /api/volunteers/history     — Historial de actividades

GET    /api/certificates           — Mis certificados
GET    /api/reports/org/[id]       — Reporte básico de impacto de la ONG
```

---

## 12. REGLAS DE NEGOCIO CRÍTICAS

1. **QR dinámico:** El token caduca cada 30 segundos. El sistema debe generar uno nuevo automáticamente. El voluntario tiene una ventana de 30s para escanear. Si el token ya fue usado por ese voluntario, mostrar "ya registrado" (no error).

2. **Duplicados:** Un voluntario no puede marcar asistencia dos veces a la misma actividad.

3. **Solo registrados pueden escanear:** Si un voluntario no se registró previamente a la actividad, el sistema puede permitirle registrar asistencia de todas formas (walk-in), pero debe quedar marcado como `walk_in: true`.

4. **Cálculo de horas:** Las horas se calculan al CERRAR la actividad (status → completed), no al momento del escaneo. Se usan `start_time` y `end_time` de la actividad.

5. **Certificados:** Un certificado se emite automáticamente cuando el voluntario acumula 10 horas en actividades que requieren una habilidad específica. El certificado es un PDF generado server-side.

6. **Multi-tenant:** Todo query a la base de datos debe filtrar por `org_id`. Usar RLS de Supabase como segunda capa de seguridad.

7. **Roles:** Un usuario puede ser `org_admin` en una organización y `volunteer` al mismo tiempo. El rol es contextual, no global.

---

## 13. SEGURIDAD Y BUENAS PRÁCTICAS

### Seguridad
- **Autenticación:** JWT via Supabase Auth, tokens en httpOnly cookies (nunca en localStorage)
- **Autorización:** Middleware de Next.js verifica rol antes de cada ruta protegida
- **RLS:** Supabase Row Level Security habilitado en todas las tablas como capa base
- **Validación:** Zod en frontend Y backend (nunca confiar solo en frontend)
- **Rate limiting:** En endpoints de QR scan y auth para prevenir abuso
- **Variables de entorno:** Nunca hardcodear claves. Usar `.env.local` en desarrollo, Vercel env en producción

### Calidad de código
- TypeScript estricto: `"strict": true` en tsconfig. Cero `any`.
- Componentes React: funcionales únicamente, hooks propios para lógica compleja
- Separación clara: `/lib` para lógica de negocio, `/components` para UI, `/app` para páginas
- Errores manejados explícitamente: nunca swallow errors silenciosamente
- Mensajes de error claros para el usuario final (no "Something went wrong")

### Performance
- Imágenes con `next/image` para optimización automática
- Datos con SWR o React Query para caché y revalidación
- Lazy loading en componentes pesados (QR scanner, gráficas)
- Paginación en listados (no cargar 1000 registros de golpe)

### Accesibilidad
- Contraste WCAG AA en todos los elementos
- Labels en todos los inputs de formularios
- Feedback visual Y textual en todas las acciones (no solo color)

---

## 14. ESTRUCTURA DE CARPETAS DEL PROYECTO

```
tribu/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              ← sidebar + nav según rol
│   │   ├── dashboard/page.tsx      ← ONG overview
│   │   ├── activities/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── qr/page.tsx
│   │   ├── volunteers/page.tsx
│   │   ├── feed/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── scan/page.tsx
│   │   ├── profile/page.tsx
│   │   └── certificates/page.tsx
│   └── api/
│       ├── activities/
│       ├── auth/
│       ├── volunteers/
│       └── reports/
├── components/
│   ├── ui/                         ← shadcn/ui components
│   ├── qr/
│   │   ├── QRDisplay.tsx
│   │   └── QRScanner.tsx
│   ├── activities/
│   ├── volunteers/
│   └── layout/
├── lib/
│   ├── supabase/
│   │   ├── client.ts               ← Supabase browser client
│   │   └── server.ts               ← Supabase server client
│   ├── validations/                ← Zod schemas
│   ├── hooks/                      ← Custom React hooks
│   └── utils/
├── middleware.ts                   ← Auth + role protection
├── prisma/
│   └── schema.prisma
└── public/
```

---

## 15. MÉTRICAS DE ÉXITO DEL MVP

| Métrica | Target |
|---------|--------|
| Tasa de registro de asistencia vía QR | +95% |
| ONGs piloto activas | 5 |
| Voluntarios activos en alpha | 50 |
| Tiempo de escaneo QR | < 5 segundos |
| Uptime de la plataforma | 99% |
| Errores críticos en producción | 0 |

---

---

# PROMPT PARA CLAUDE SONNET — CONSTRUCCIÓN DEL MVP TRIBU

> Copia este prompt completo y pégalo en Claude Sonnet (claude-sonnet-4-5 o superior). Está diseñado para construir el MVP por etapas, con código 100% funcional.

---

```
Eres un desarrollador senior full-stack experto en Next.js 14, TypeScript, Supabase y Tailwind CSS. Vas a construir el MVP completo de TRIBU, una plataforma SaaS de gestión de voluntariado para ONGs.

## REGLAS ABSOLUTAS — NUNCA VIOLARLAS

1. **Cero datos hardcodeados.** Nunca. Ningún array estático, ninguna cuenta demo, ningún usuario ficticio en el código. Todo dato viene de la base de datos real.
2. **Cero UI decorativa.** Si un botón no tiene función implementada, no existe. Si una sección no tiene datos reales, no se muestra (o muestra el estado vacío correcto).
3. **Cero placeholders.** No "// TODO: implementar", no "// coming soon". Si lo construyes, lo terminas. Si no lo construyes en esta etapa, no aparece en el código.
4. **TypeScript estricto.** `"strict": true`. Cero `any`. Todos los tipos definidos explícitamente.
5. **Errores manejados.** Todo `async/await` tiene `try/catch`. Todos los errores muestran un mensaje claro al usuario.
6. **Validación en ambos lados.** Zod en el cliente Y en el servidor. Nunca confiar solo en el frontend.
7. **RLS activado.** Toda tabla en Supabase tiene Row Level Security. Los usuarios solo ven sus datos.
8. **Cada etapa debe ser deployable.** Al terminar cada etapa, el sistema debe funcionar end-to-end sin errores.

## STACK TÉCNICO (no cambiar sin preguntar)

- **Frontend/Backend:** Next.js 14 con App Router
- **Base de datos:** PostgreSQL via Supabase
- **ORM:** Prisma
- **Auth:** Supabase Auth (email/password + magic link)
- **UI:** Tailwind CSS + shadcn/ui
- **Estado:** Zustand para estado global
- **Forms:** React Hook Form + Zod
- **QR generación:** react-qr-code
- **QR escaneo:** html5-qrcode
- **Gráficas:** Recharts
- **Real-time:** Supabase Realtime
- **Deploy:** Vercel + Supabase

## CONTEXTO DEL PRODUCTO

TRIBU conecta 3 actores:
1. **ONGs (org_admin):** Crean actividades, gestionan voluntarios, ven métricas de impacto
2. **Voluntarios:** Se registran a actividades, escanean QR para marcar asistencia, acumulan horas y obtienen certificados de habilidades
3. **Plataforma:** Hace matchmaking entre habilidades requeridas y perfiles de voluntarios, genera certificados automáticamente

El flujo más crítico: ONG crea actividad → voluntario se registra → en el evento, admin muestra QR dinámico (caduca cada 30s) → voluntario lo escanea con el celular → asistencia registrada en tiempo real → al cerrar actividad se calculan horas → si acumula 10h en una skill, se genera certificado.

## MODELO DE DATOS

Construye las siguientes tablas en Supabase con estos campos exactos:

**organizations:** id (uuid PK), name (text NN), description (text), logo_url (text), owner_id (uuid → auth.users), created_at (timestamptz default now())

**user_profiles:** id (uuid PK = auth.users.id), email (text unique NN), full_name (text NN), phone (text), avatar_url (text), created_at (timestamptz)

**volunteer_profiles:** id (uuid PK), user_id (uuid unique → user_profiles.id), bio (text), skills (text[]), university (text), career (text), total_hours (numeric default 0), created_at (timestamptz)

**org_members:** id (uuid PK), org_id (uuid → organizations.id), user_id (uuid → user_profiles.id), role (text check: 'admin' | 'coordinator'), joined_at (timestamptz default now())

**activities:** id (uuid PK), org_id (uuid → organizations.id), title (text NN), description (text), required_skills (text[]), location (text), start_time (timestamptz NN), end_time (timestamptz NN), max_volunteers (int), status (text default 'draft' check: 'draft'|'open'|'in_progress'|'completed'|'cancelled'), created_by (uuid → user_profiles.id), created_at (timestamptz)

**activity_registrations:** id (uuid PK), activity_id (uuid → activities.id), volunteer_id (uuid → user_profiles.id), status (text default 'registered' check: 'registered'|'attended'|'absent'|'cancelled'), registered_at (timestamptz default now()), attended_at (timestamptz), UNIQUE(activity_id, volunteer_id)

**qr_tokens:** id (uuid PK), activity_id (uuid → activities.id), token (uuid unique default gen_random_uuid()), expires_at (timestamptz NN), created_at (timestamptz)

**attendance_logs:** id (uuid PK), activity_id (uuid → activities.id), volunteer_id (uuid → user_profiles.id), scanned_at (timestamptz default now()), hours_credited (numeric), is_walk_in (boolean default false), UNIQUE(activity_id, volunteer_id)

**certificates:** id (uuid PK), volunteer_id (uuid → user_profiles.id), skill (text NN), hours_required (numeric default 10), hours_completed (numeric default 0), issued_at (timestamptz), certificate_url (text), status (text default 'in_progress' check: 'in_progress'|'issued')

Incluye también:
- Trigger SQL que actualiza `volunteer_profiles.total_hours` cuando se inserta en `attendance_logs`
- Trigger SQL que verifica y emite certificados cuando `total_hours` para una skill alcanza 10

## ETAPAS DE CONSTRUCCIÓN

Construye el MVP en las siguientes etapas, en orden. No avances a la siguiente etapa hasta que la anterior funcione completamente.

---

### ETAPA 1: Configuración base y autenticación

**Lo que debe funcionar al terminar:**
- Proyecto Next.js 14 creado con TypeScript estricto
- Supabase configurado con todas las tablas, RLS y triggers
- Prisma schema sincronizado
- Login con email/password: funcional, tokens en httpOnly cookies
- Registro de usuario con selección de rol (ONG admin o Voluntario): funcional
- Verificación de email: funcional (Supabase maneja el email)
- Middleware de Next.js que protege rutas por rol
- Layout diferente según rol (sidebar para ONG, nav bottom para móvil en voluntario)
- Logout funcional
- Redirección correcta post-login según rol

**Entregables:**
- `middleware.ts` completo con protección de rutas
- `lib/supabase/client.ts` y `lib/supabase/server.ts`
- Páginas: `/auth/login`, `/auth/register`
- SQL completo para crear todas las tablas con RLS
- Todos los tipos TypeScript en `/types/index.ts`

---

### ETAPA 2: ONGs — Gestión de actividades

**Lo que debe funcionar al terminar:**
- Una ONG puede crear su perfil de organización (nombre, descripción, logo upload a Supabase Storage)
- Dashboard de ONG con: contador de actividades totales, voluntarios registrados, horas totales generadas (datos reales de la BD)
- Listado de actividades de la organización con estados visuales reales
- Crear nueva actividad: formulario completo con validación (título, descripción, habilidades requeridas como tags, fecha inicio/fin, lugar, máximo voluntarios)
- Editar actividad (solo si está en 'draft')
- Cambiar estado de actividad: draft → open → in_progress → completed
- Ver detalle de actividad: quién está registrado, estado de asistencia

**No construir en esta etapa:** QR, escaneo, reportes ESG, certificados

**Entregables:**
- API routes: CRUD completo de actividades
- Páginas: `/dashboard`, `/activities`, `/activities/new`, `/activities/[id]`
- Componentes: `ActivityCard`, `ActivityForm`, `SkillTagInput`, `StatusBadge`

---

### ETAPA 3: Voluntarios — Feed y registro

**Lo que debe funcionar al terminar:**
- Voluntario completa su perfil: bio, habilidades (selección múltiple + texto libre), universidad, carrera, foto
- Feed de actividades abiertas (status='open') con filtros reales: por habilidad, por fecha
- El feed prioriza actividades donde hay match de habilidades con el perfil del voluntario (simple: si required_skills contiene alguna skill del voluntario, aparece primero)
- Detalle de actividad con info completa y lista de habilidades requeridas
- Botón "Registrarme" funcional: crea registro en `activity_registrations`
- Botón "Cancelar registro" funcional
- Validación: no puede registrarse si la actividad está llena (max_volunteers)
- Validación: no puede registrarse dos veces
- Página "Mis actividades": historial de actividades registradas y asistidas

**Entregables:**
- API routes: registro/cancelación, feed con filtros
- Páginas: `/feed`, `/feed/[id]`, `/profile`, `/my-activities`
- Componentes: `ActivityFeed`, `SkillMatchBadge`, `RegistrationButton`

---

### ETAPA 4: Sistema QR — El flujo crítico

**Lo que debe funcionar al terminar:**

**Lado ONG:**
- Al abrir una actividad en estado 'in_progress', aparece sección "Registro de asistencia"
- Botón "Mostrar QR" abre pantalla dedicada `/activities/[id]/qr`
- La pantalla QR muestra: el código QR grande, nombre de la actividad, contador regresivo de 30 segundos
- El QR se regenera automáticamente cada 30 segundos (sin recargar la página, via polling o WebSocket)
- Lista en tiempo real de quién ya escaneó (con nombre, foto, hora de escaneo) — se actualiza sin recargar via Supabase Realtime
- Contador: "X de Y voluntarios registrados han llegado"

**Lado Voluntario:**
- Página `/scan` accesible desde nav principal
- Solicita permiso de cámara correctamente
- Escanea el QR y llama a la API
- Respuestas claras:
  - ✅ "Asistencia registrada — [Nombre de actividad]"
  - ⚠️ "Ya registraste tu asistencia a esta actividad"
  - ❌ "QR expirado — pide al organizador que lo muestre de nuevo"
  - ❌ "No estás registrado en esta actividad" (pero registra como walk_in si el admin lo permite)
- Funciona en mobile (la cámara del celular)

**API de QR:**
- `GET /api/activities/[id]/qr`: devuelve el token vigente. Si no existe o expiró, genera uno nuevo. Nunca devuelve token expirado.
- `POST /api/activities/[id]/scan`: recibe `{ token, volunteer_id }`. Valida token, valida que no sea duplicado, inserta en `attendance_logs`, actualiza `activity_registrations.status` a 'attended'. Devuelve respuesta tipada.

**Entregables:**
- `components/qr/QRDisplay.tsx` con auto-refresh
- `components/qr/QRScanner.tsx` con manejo de permisos
- `/activities/[id]/qr/page.tsx` con Realtime
- API routes completas con todos los casos de error

---

### ETAPA 5: Horas, certificados y perfil del voluntario

**Lo que debe funcionar al terminar:**
- Al cerrar actividad (status → completed): trigger calcula horas para cada asistente y actualiza `volunteer_profiles.total_hours`
- Perfil del voluntario muestra:
  - Total de horas acumuladas (real)
  - Breakdown por habilidad: "Diseño: 8h, Comunicación: 4h" (calculado de attendance_logs + activities.required_skills)
  - Historial de actividades con fechas y horas
  - Nivel según horas: Nuevo (0-9h), Activo (10-49h), Experto (50h+)
- Sistema de certificados:
  - Cuando una skill llega a 10h validadas → se emite certificado automáticamente
  - El certificado es un PDF generado server-side con: nombre del voluntario, habilidad, horas, fecha, logo de TRIBU, firma digital (hash SHA-256 del contenido para verificabilidad)
  - PDF almacenado en Supabase Storage
  - URL pública para compartir/descargar
- Página `/certificates` muestra: certificados emitidos (con descarga) y certificados en progreso (con barra de progreso real)

**Para el PDF usar:** `@react-pdf/renderer` o `puppeteer` server-side

**Entregables:**
- Trigger SQL para cálculo de horas al cerrar actividad
- Trigger SQL para emisión de certificados
- API route para generar y almacenar PDF
- Páginas: `/profile` completo, `/certificates`
- Componentes: `HoursBreakdown`, `CertificateCard`, `ProgressBar`

---

### ETAPA 6: Dashboard de impacto para ONG (métricas reales)

**Lo que debe funcionar al terminar:**
- Dashboard de ONG expandido con métricas reales de la BD:
  - Total de horas generadas por la organización
  - Tasa de asistencia: (asistieron / registrados) × 100
  - Voluntarios únicos que han participado
  - Actividades completadas vs. canceladas
  - Habilidades más comunes en el banco de voluntarios de la ONG
- Gráfica de actividad mensual (Recharts): barras con actividades y asistencia por mes
- Tabla de top voluntarios por horas en la organización
- Banco de voluntarios `/volunteers`:
  - Listado de todos los voluntarios que han participado en alguna actividad de la ONG
  - Filtros por habilidad (funcionales, consultan la BD)
  - Perfil resumido de cada voluntario con habilidades y horas

**No construir en esta etapa:** reportes ESG (eso es producto IaaS, fuera del MVP)

**Entregables:**
- Queries SQL optimizadas para métricas (usar vistas de Supabase si aplica)
- API routes para métricas
- Páginas: `/dashboard` actualizado, `/volunteers`
- Componentes: `MetricCard`, `ActivityChart`, `VolunteerTable`

---

## INSTRUCCIONES GENERALES PARA TODAS LAS ETAPAS

### Al comenzar cada etapa:
1. Lista los archivos que vas a crear/modificar
2. Muestra el SQL de BD si aplica (con RLS policies)
3. Construye en este orden: tipos → BD/API → componentes → páginas → tests

### Al terminar cada etapa:
1. Proporciona el checklist de "cómo verificar que funciona"
2. Lista las variables de entorno necesarias
3. Documenta cualquier configuración manual necesaria en Supabase

### Formato de entrega de código:
- Cada archivo completo, no fragmentos
- Path completo del archivo en el comentario superior
- Imports al inicio, exports al final
- Comentarios solo donde la lógica no es obvia

### Variables de entorno requeridas (configurar en .env.local):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
NEXT_PUBLIC_APP_URL=
```

---

## ACCESO A SUPABASE — PROYECTO EXISTENTE

Tienes acceso directo a un proyecto Supabase ya creado llamado **"Gabo's Project"**. Debes usar este proyecto para todo: crear las tablas, configurar el Auth y las políticas RLS.

### Lo que debes hacer en "Gabo's Project" en la ETAPA 1:

1. **Ir al SQL Editor de Supabase** (`https://supabase.com/dashboard` → proyecto "Gabo's Project" → SQL Editor) y ejecutar el SQL completo que generarás para:
   - Crear todas las tablas del modelo de datos
   - Crear todos los índices necesarios
   - Activar RLS en cada tabla
   - Crear todas las políticas RLS
   - Crear los triggers de cálculo de horas y emisión de certificados

2. **Configurar Supabase Auth** (Authentication → Settings en el dashboard):
   - Habilitar proveedor Email/Password
   - Configurar la URL de redirección post-verificación a `http://localhost:3000/auth/callback`
   - Habilitar "Confirm email" para verificación real

3. **Obtener las credenciales del proyecto** (Settings → API en el dashboard):
   - `NEXT_PUBLIC_SUPABASE_URL` → Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → anon / public key
   - `SUPABASE_SERVICE_ROLE_KEY` → service_role key (nunca exponerla al cliente)
   - `DATABASE_URL` → Settings → Database → Connection string (mode: URI)

4. **Crear el Storage bucket** (Storage → New bucket):
   - Nombre: `avatars` — público, para fotos de perfil
   - Nombre: `logos` — público, para logos de ONGs
   - Nombre: `certificates` — privado, para PDFs de certificados

### Instrucciones de ejecución del SQL:
- Ejecuta el SQL en bloques, en este orden: extensiones → tablas → índices → RLS → triggers
- Si un bloque falla, muéstrame el error antes de continuar
- Verifica cada tabla en Table Editor después de crearla
- Después de crear las tablas, confirma en el Table Editor que existen: `organizations`, `user_profiles`, `volunteer_profiles`, `org_members`, `activities`, `activity_registrations`, `qr_tokens`, `attendance_logs`, `certificates`

### Importante:
- El nombre del proyecto es **"Gabo's Project"** — asegúrate de estar en el proyecto correcto antes de ejecutar cualquier SQL
- Todas las credenciales van en `.env.local` en local y en las variables de entorno de Vercel en producción
- Nunca commitear `.env.local` al repositorio (agregar al `.gitignore`)

---

Empieza por la ETAPA 1. Cuando termines y yo confirme que funciona, procederemos a la ETAPA 2. No mezcles etapas. No adelantes código que no corresponde a la etapa actual.

¿Listo? Comienza con la ETAPA 1.
```

---

*Fin del documento — TRIBU Knowledge Base v1.0*
*Preparado para Hackathon 2026*

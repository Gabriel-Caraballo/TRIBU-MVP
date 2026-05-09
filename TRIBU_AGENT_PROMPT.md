# PROMPT PARA AGENTE — ARREGLAR Y COMPLETAR LA PLATAFORMA TRIBU MVP

> **Instrucción al agente:** Lee este documento completo antes de escribir una sola línea de código. Confirma que lo has leído respondiendo: "TRIBU_PROMPT leído. Procedo con el diagnóstico del estado actual."

---

## CONTEXTO DEL PROYECTO

**TRIBU** es una plataforma SaaS de gestión estratégica de voluntariado para ONGs. Está desplegada en Vercel en `https://tribu-mvp.vercel.app`. Actualmente tiene un MVP parcialmente funcional construido con Next.js 14 + TypeScript + Supabase + Tailwind CSS + shadcn/ui.

Tu tarea es **auditar, corregir y completar** la plataforma para que coincida exactamente con la especificación del producto definida en este documento. No reescribas lo que ya funciona; construye encima.

---

## REGLAS ABSOLUTAS — NUNCA VIOLARLAS

1. **Cero datos hardcodeados.** Ningún array estático, ninguna cuenta demo, ningún usuario ficticio. Todo dato viene de Supabase.
2. **Cero UI decorativa.** Si un botón no tiene función implementada, no existe. Si una sección no tiene datos reales, muestra el estado vacío correcto.
3. **Cero placeholders.** No "// TODO", no "// coming soon". Si lo construyes, lo terminas.
4. **TypeScript estricto.** `"strict": true`. Cero `any`. Todos los tipos definidos explícitamente en `/types/index.ts`.
5. **Errores manejados.** Todo `async/await` tiene `try/catch`. Los errores muestran mensaje claro al usuario con toast.
6. **Validación en ambos lados.** Zod en cliente Y servidor.
7. **RLS activado.** Toda tabla en Supabase tiene Row Level Security.
8. **Cada entrega debe ser deployable.** El sistema debe funcionar end-to-end sin errores en Vercel.
9. **No mezcles etapas.** Termina y verifica cada etapa antes de pasar a la siguiente.
10. **Antes de crear un archivo, verifica si ya existe.** Si existe, edítalo; no lo sobreescribas.

---

## STACK TÉCNICO (no cambiar sin preguntar)

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript estricto |
| Base de datos | PostgreSQL via Supabase |
| Auth | Supabase Auth (email/password) |
| UI | Tailwind CSS + shadcn/ui |
| Estado global | Zustand |
| Formularios | React Hook Form + Zod |
| QR generación | `react-qr-code` |
| QR escaneo | `html5-qrcode` |
| Gráficas | Recharts |
| Real-time | Supabase Realtime |
| Deploy | Vercel |

---

## DIAGNÓSTICO — QUÉ TIENE LA PLATAFORMA ACTUALMENTE

Basado en las capturas de pantalla del estado actual, la plataforma tiene:

### ✅ LO QUE YA EXISTE (no romper)
- Autenticación funcional (login / registro con email/password)
- Sidebar de navegación con: Feed, Mis actividades, Escanear QR, Mi perfil, Certificados
- Página Feed (`/feed`) con filtros de Habilidad, Fecha y Búsqueda por título — aunque sin actividades activas
- Página Mis Actividades (`/my-activities`) con contadores de estadísticas (Total, Próximas, Completadas, Pendientes)
- Página Mi Perfil con: banner de horas acumuladas (6 hrs), nivel Rookie con barra de progreso, accesos rápidos a actividades/QR/certificados, campos de Nombre, Ciudad, Biografía, Habilidades
- Página Certificados (`/certificates`) con la explicación de cómo funciona y un certificado "Primeros auxilios" en progreso (0/10 horas)
- Usuario registrado: Gabriel Caraballo, Santo Domingo, nivel Nuevo, 6 horas acumuladas

### ❌ LO QUE FALTA O ESTÁ MAL

**Problemas críticos de funcionalidad:**
1. El Feed no tiene actividades — no hay actividades creadas en la BD o no hay ONGs creadas
2. "Mis Actividades" muestra todos los contadores en 0 — el usuario tiene 6 horas pero 0 actividades registradas (inconsistencia de datos)
3. El QR Escáner (`/scan`) existe en el nav pero no sabemos si funciona completamente
4. Los certificados muestran "Primeros auxilios" en progreso con 0/10 horas, pero el usuario tiene 6 horas — esto sugiere que las horas no están siendo asignadas correctamente a habilidades

**Funcionalidades completamente faltantes (según spec):**
1. **Dashboard de ONG** — No existe ningún panel para que las ONGs gestionen actividades
2. **Creación de actividades** — No existe formulario de creación para ONGs
3. **Flujo de aprobación** — Los voluntarios deben solicitar unirse y la ONG debe aprobar
4. **QR Dinámico para ONGs** — La pantalla de QR para que la ONG lo muestre en el evento
5. **Sistema de niveles correcto** — El nivel actual dice "Nuevo" en el sidebar pero "Rookie" en el perfil (inconsistencia)
6. **Sistema de horas por habilidad** — Las horas se acumulan globalmente pero no se desglosan por habilidad
7. **Generación de certificados PDF** — Los certificados deben generarse como PDF descargable
8. **Banco de voluntarios para ONGs** — Las ONGs no pueden ver/filtrar voluntarios por habilidad
9. **Métricas de impacto** — No existe dashboard con métricas reales para ONGs
10. **Onboarding de ONG** — No existe flujo para que una ONG registre su organización

---

## ESTRUCTURA DE CARPETAS DEFINITIVA

Reorganiza el proyecto siguiendo esta estructura exacta. Si ya existen archivos en otras ubicaciones, muévelos al lugar correcto.

```
tribu/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx              ← Layout sin sidebar (solo para auth)
│   │
│   ├── (volunteer)/                ← Grupo de rutas para voluntarios
│   │   ├── layout.tsx              ← Sidebar voluntario + bottom nav mobile
│   │   ├── feed/
│   │   │   ├── page.tsx            ← Feed de actividades con filtros
│   │   │   └── [id]/
│   │   │       └── page.tsx        ← Detalle de actividad + botón registrarse
│   │   ├── my-activities/
│   │   │   └── page.tsx            ← Mis actividades con estados reales
│   │   ├── scan/
│   │   │   └── page.tsx            ← Escáner QR con cámara
│   │   ├── profile/
│   │   │   └── page.tsx            ← Perfil completo con horas por skill
│   │   └── certificates/
│   │       └── page.tsx            ← Certificados emitidos + en progreso
│   │
│   ├── (org)/                      ← Grupo de rutas para administradores de ONG
│   │   ├── layout.tsx              ← Sidebar de ONG
│   │   ├── dashboard/
│   │   │   └── page.tsx            ← Overview: métricas, actividades próximas
│   │   ├── activities/
│   │   │   ├── page.tsx            ← Lista de actividades de la ONG
│   │   │   ├── new/
│   │   │   │   └── page.tsx        ← Crear nueva actividad
│   │   │   └── [id]/
│   │   │       ├── page.tsx        ← Detalle: registrados, asistencia
│   │   │       └── qr/
│   │   │           └── page.tsx    ← Pantalla QR dinámico para mostrar en evento
│   │   ├── volunteers/
│   │   │   └── page.tsx            ← Banco de voluntarios con filtros
│   │   └── organization/
│   │       └── page.tsx            ← Perfil y configuración de la organización
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   └── login/route.ts
│   │   ├── activities/
│   │   │   ├── route.ts            ← GET (feed) / POST (crear)
│   │   │   └── [id]/
│   │   │       ├── route.ts        ← GET / PATCH
│   │   │       ├── status/route.ts ← PATCH cambiar estado
│   │   │       ├── register/route.ts ← POST registrarse / DELETE cancelar
│   │   │       ├── qr/route.ts     ← GET token QR vigente
│   │   │       ├── scan/route.ts   ← POST escanear QR
│   │   │       └── attendance/route.ts ← GET lista en tiempo real
│   │   ├── volunteers/
│   │   │   ├── profile/route.ts    ← GET / PATCH perfil
│   │   │   └── history/route.ts    ← GET historial
│   │   ├── organizations/
│   │   │   ├── route.ts            ← GET / POST
│   │   │   └── [id]/route.ts       ← GET / PATCH
│   │   ├── certificates/
│   │   │   └── route.ts            ← GET certificados del voluntario
│   │   └── reports/
│   │       └── route.ts            ← GET métricas de impacto para ONG
│   │
│   ├── layout.tsx                  ← Root layout (providers, fonts)
│   └── page.tsx                    ← Redirect a /feed o /dashboard según rol
│
├── components/
│   ├── ui/                         ← shadcn/ui (NO modificar manualmente)
│   │
│   ├── layout/
│   │   ├── VolunteerSidebar.tsx    ← Sidebar de voluntario (desktop)
│   │   ├── VolunteerBottomNav.tsx  ← Nav inferior para mobile
│   │   ├── OrgSidebar.tsx          ← Sidebar de ONG
│   │   └── UserCard.tsx            ← Tarjeta de usuario en sidebar inferior
│   │
│   ├── activities/
│   │   ├── ActivityCard.tsx        ← Card de actividad (feed)
│   │   ├── ActivityForm.tsx        ← Formulario crear/editar actividad
│   │   ├── ActivityDetail.tsx      ← Vista detalle de actividad
│   │   ├── SkillTagInput.tsx       ← Input de habilidades como tags
│   │   ├── StatusBadge.tsx         ← Badge de estado (open/in_progress/etc)
│   │   └── RegistrationButton.tsx  ← Botón registrarse/cancelar con estado
│   │
│   ├── qr/
│   │   ├── QRDisplay.tsx           ← QR con auto-refresh cada 25s
│   │   └── QRScanner.tsx           ← Escáner con cámara, manejo de permisos
│   │
│   ├── volunteers/
│   │   ├── HoursBreakdown.tsx      ← Desglose de horas por habilidad
│   │   ├── CertificateCard.tsx     ← Tarjeta de certificado
│   │   ├── LevelProgress.tsx       ← Barra de progreso de nivel
│   │   └── VolunteerTable.tsx      ← Tabla de voluntarios para ONG
│   │
│   ├── dashboard/
│   │   ├── MetricCard.tsx          ← Tarjeta de métrica con número y label
│   │   ├── ActivityChart.tsx       ← Gráfica mensual con Recharts
│   │   └── AttendanceList.tsx      ← Lista en tiempo real de asistentes
│   │
│   └── shared/
│       ├── SkillBadge.tsx          ← Badge visual por habilidad
│       ├── EmptyState.tsx          ← Estado vacío reutilizable
│       └── LoadingSpinner.tsx      ← Spinner de carga
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts               ← Supabase browser client (singleton)
│   │   └── server.ts               ← Supabase server client (cookies)
│   ├── validations/
│   │   ├── activity.ts             ← Zod schema para actividades
│   │   ├── profile.ts              ← Zod schema para perfil
│   │   └── auth.ts                 ← Zod schema para auth
│   ├── hooks/
│   │   ├── useUser.ts              ← Hook para datos del usuario autenticado
│   │   ├── useActivities.ts        ← Hook para feed de actividades
│   │   └── useRealtime.ts          ← Hook para Supabase Realtime
│   └── utils/
│       ├── hours.ts                ← Cálculo de horas (end_time - start_time)
│       ├── levels.ts               ← Lógica de niveles según horas
│       └── certificates.ts         ← Generación de certificados PDF
│
├── store/
│   └── userStore.ts                ← Zustand store para estado del usuario
│
├── types/
│   └── index.ts                    ← Todos los tipos TypeScript del dominio
│
├── middleware.ts                   ← Protección de rutas por rol
│
├── prisma/
│   └── schema.prisma               ← Schema sincronizado con Supabase
│
├── public/
│   ├── logo.svg
│   └── icons/
│
├── .env.local                      ← Variables de entorno (NO commitear)
├── .gitignore                      ← Incluye .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## MODELO DE DATOS COMPLETO (Supabase / PostgreSQL)

Ejecuta este SQL completo en el SQL Editor de Supabase antes de tocar el código:

```sql
-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================
-- TABLAS
-- =============================

-- Perfiles de usuario (sincronizado con auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('volunteer', 'org_admin')),
  phone TEXT,
  avatar_url TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Perfiles de voluntario (extensión de user_profiles para rol volunteer)
CREATE TABLE IF NOT EXISTS volunteer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  university TEXT,
  career TEXT,
  total_hours NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizaciones (ONGs)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  rnc TEXT,                         -- Registro Nacional del Contribuyente
  is_verified BOOLEAN DEFAULT FALSE,
  owner_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Miembros de organización (admins y coordinadores)
CREATE TABLE IF NOT EXISTS org_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'coordinator')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

-- Actividades de voluntariado
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  required_skills TEXT[] DEFAULT '{}',
  location TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  max_volunteers INT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'in_progress', 'completed', 'cancelled')),
  is_private BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inscripciones a actividades
CREATE TABLE IF NOT EXISTS activity_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'attended', 'absent', 'cancelled')),
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  attended_at TIMESTAMPTZ,
  UNIQUE(activity_id, volunteer_id)
);

-- Tokens QR (rotativos, TTL 30 segundos)
CREATE TABLE IF NOT EXISTS qr_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  token UUID UNIQUE DEFAULT uuid_generate_v4(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Logs de asistencia (registro cuando se escanea el QR)
CREATE TABLE IF NOT EXISTS attendance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  hours_credited NUMERIC,
  is_walk_in BOOLEAN DEFAULT FALSE,
  UNIQUE(activity_id, volunteer_id)
);

-- Horas por habilidad (desglose para certificados)
CREATE TABLE IF NOT EXISTS skill_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  volunteer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  hours NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(volunteer_id, skill)
);

-- Certificados de competencia
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  volunteer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  hours_required NUMERIC DEFAULT 10,
  hours_completed NUMERIC DEFAULT 0,
  issued_at TIMESTAMPTZ,
  certificate_url TEXT,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'issued')),
  UNIQUE(volunteer_id, skill)
);

-- =============================
-- ÍNDICES
-- =============================
CREATE INDEX IF NOT EXISTS idx_activities_org_id ON activities(org_id);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activity_registrations_volunteer ON activity_registrations(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_activity_registrations_activity ON activity_registrations(activity_id);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_volunteer ON attendance_logs(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_skill_hours_volunteer ON skill_hours(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_certificates_volunteer ON certificates(volunteer_id);

-- =============================
-- TRIGGERS
-- =============================

-- Trigger: crear user_profile automáticamente al registrar en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'volunteer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: crear volunteer_profile automáticamente cuando role = 'volunteer'
CREATE OR REPLACE FUNCTION public.handle_volunteer_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'volunteer' THEN
    INSERT INTO public.volunteer_profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_profile_created ON public.user_profiles;
CREATE TRIGGER on_user_profile_created
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_volunteer_profile();

-- Trigger: calcular horas al cerrar actividad (status → completed)
CREATE OR REPLACE FUNCTION public.calculate_hours_on_completion()
RETURNS TRIGGER AS $$
DECLARE
  activity_duration NUMERIC;
  skill_name TEXT;
BEGIN
  -- Solo ejecutar cuando status cambia a 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Calcular duración en horas
    activity_duration := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 3600;
    
    -- Actualizar hours_credited en attendance_logs
    UPDATE attendance_logs
    SET hours_credited = activity_duration
    WHERE activity_id = NEW.id AND hours_credited IS NULL;
    
    -- Actualizar total_hours en volunteer_profiles
    UPDATE volunteer_profiles vp
    SET total_hours = total_hours + activity_duration
    FROM attendance_logs al
    WHERE al.activity_id = NEW.id
      AND al.volunteer_id = vp.user_id
      AND al.hours_credited = activity_duration;
    
    -- Actualizar status en activity_registrations
    UPDATE activity_registrations
    SET status = 'attended'
    WHERE activity_id = NEW.id
      AND volunteer_id IN (
        SELECT volunteer_id FROM attendance_logs WHERE activity_id = NEW.id
      );
    
    -- Actualizar skill_hours para cada habilidad de la actividad
    FOREACH skill_name IN ARRAY NEW.required_skills
    LOOP
      INSERT INTO skill_hours (volunteer_id, skill, hours)
      SELECT al.volunteer_id, skill_name, activity_duration
      FROM attendance_logs al
      WHERE al.activity_id = NEW.id
      ON CONFLICT (volunteer_id, skill)
      DO UPDATE SET hours = skill_hours.hours + activity_duration,
                    updated_at = NOW();
    END LOOP;
    
    -- Verificar y emitir certificados (10h por skill)
    INSERT INTO certificates (volunteer_id, skill, hours_completed, issued_at, status)
    SELECT sh.volunteer_id, sh.skill, sh.hours, NOW(), 'issued'
    FROM skill_hours sh
    WHERE sh.hours >= 10
      AND NOT EXISTS (
        SELECT 1 FROM certificates c
        WHERE c.volunteer_id = sh.volunteer_id
          AND c.skill = sh.skill
          AND c.status = 'issued'
      )
    ON CONFLICT (volunteer_id, skill)
    DO UPDATE SET hours_completed = EXCLUDED.hours_completed,
                  issued_at = EXCLUDED.issued_at,
                  status = 'issued';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_activity_completed ON activities;
CREATE TRIGGER on_activity_completed
  AFTER UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION public.calculate_hours_on_completion();

-- =============================
-- ROW LEVEL SECURITY
-- =============================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- user_profiles: cada usuario ve y edita solo su perfil
CREATE POLICY "users_own_profile" ON user_profiles
  FOR ALL USING (auth.uid() = id);

-- volunteer_profiles: voluntario ve y edita su perfil; org_admins pueden ver todos
CREATE POLICY "volunteer_own_profile" ON volunteer_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "org_admin_view_volunteers" ON volunteer_profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'org_admin')
  );

-- organizations: admins de la org pueden editar; todos los autenticados pueden ver
CREATE POLICY "orgs_public_read" ON organizations
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "orgs_owner_write" ON organizations
  FOR ALL USING (owner_id = auth.uid());

-- org_members: miembros de la org pueden ver; dueño puede gestionar
CREATE POLICY "org_members_read" ON org_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    org_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
  );

CREATE POLICY "org_members_write" ON org_members
  FOR ALL USING (
    org_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
  );

-- activities: status='open' visible para todos; resto solo para miembros de la org
CREATE POLICY "activities_open_public" ON activities
  FOR SELECT USING (
    status = 'open' AND is_private = FALSE OR
    org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
  );

CREATE POLICY "activities_org_write" ON activities
  FOR ALL USING (
    org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
  );

-- activity_registrations: voluntario ve sus inscripciones; ONG ve las de su actividad
CREATE POLICY "registrations_volunteer" ON activity_registrations
  FOR ALL USING (volunteer_id = auth.uid());

CREATE POLICY "registrations_org_read" ON activity_registrations
  FOR SELECT USING (
    activity_id IN (
      SELECT id FROM activities WHERE org_id IN (
        SELECT org_id FROM org_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "registrations_org_update" ON activity_registrations
  FOR UPDATE USING (
    activity_id IN (
      SELECT id FROM activities WHERE org_id IN (
        SELECT org_id FROM org_members WHERE user_id = auth.uid()
      )
    )
  );

-- qr_tokens: solo miembros de la ONG propietaria
CREATE POLICY "qr_tokens_org" ON qr_tokens
  FOR ALL USING (
    activity_id IN (
      SELECT id FROM activities WHERE org_id IN (
        SELECT org_id FROM org_members WHERE user_id = auth.uid()
      )
    )
  );

-- attendance_logs: voluntario ve los suyos; ONG ve los de su actividad
CREATE POLICY "attendance_volunteer" ON attendance_logs
  FOR SELECT USING (volunteer_id = auth.uid());

CREATE POLICY "attendance_org" ON attendance_logs
  FOR ALL USING (
    activity_id IN (
      SELECT id FROM activities WHERE org_id IN (
        SELECT org_id FROM org_members WHERE user_id = auth.uid()
      )
    )
  );

-- skill_hours y certificates: cada voluntario ve los suyos
CREATE POLICY "skill_hours_own" ON skill_hours
  FOR ALL USING (volunteer_id = auth.uid());

CREATE POLICY "certificates_own" ON certificates
  FOR ALL USING (volunteer_id = auth.uid());
```

---

## SISTEMA DE NIVELES (lógica unificada)

Implementar en `lib/utils/levels.ts`. Usar esta lógica en TODO el codebase, sin excepción:

```typescript
export type UserLevel = {
  name: string;        // Nombre del nivel
  label: string;       // Label para mostrar (en español)
  minHours: number;
  maxHours: number;
  nextLevelHours: number;
  color: string;       // Color Tailwind
};

export const LEVELS: UserLevel[] = [
  { name: 'nuevo',   label: 'Nuevo',   minHours: 0,   maxHours: 9,   nextLevelHours: 10,  color: 'text-green-500' },
  { name: 'activo',  label: 'Activo',  minHours: 10,  maxHours: 49,  nextLevelHours: 50,  color: 'text-blue-500'  },
  { name: 'experto', label: 'Experto', minHours: 50,  maxHours: 999, nextLevelHours: 999, color: 'text-purple-500'},
];

export function getLevel(totalHours: number): UserLevel {
  return LEVELS.find(l => totalHours >= l.minHours && totalHours <= l.maxHours) ?? LEVELS[0];
}

export function getLevelProgress(totalHours: number): number {
  const level = getLevel(totalHours);
  if (level.nextLevelHours === 999) return 100;
  const range = level.nextLevelHours - level.minHours;
  const progress = totalHours - level.minHours;
  return Math.round((progress / range) * 100);
}
```

**IMPORTANTE:** El nivel actual muestra "Nuevo" en el sidebar y "Rookie" en el perfil. Esto es una inconsistencia. Eliminar completamente el término "Rookie" del codebase y usar solo los nombres definidos arriba.

---

## FLUJOS FUNCIONALES QUE DEBEN FUNCIONAR

### Flujo A: Registro y onboarding
```
/auth/register → selecciona rol (ONG admin / Voluntario)
  → Voluntario: completa perfil (bio, skills, ciudad, universidad, carrera)
  → ONG admin: crea organización (nombre, descripción, logo)
  → Verificación de email (Supabase maneja el envío)
  → Redirige a /feed (voluntario) o /dashboard (ONG admin)
```

### Flujo B: ONG crea actividad
```
/dashboard → "Nueva actividad"
  → Formulario: título, descripción, habilidades requeridas (tags), 
    fecha inicio, fecha fin, lugar, máximo voluntarios, público/privado
  → Guardar como borrador (status: 'draft')
  → Publicar (status: 'open') → visible en feed de voluntarios
```

### Flujo C: Voluntario se inscribe (requiere aprobación)
```
/feed → selecciona actividad → ve detalles completos
  → Botón "Solicitar unirme" → status: 'pending'
  → ONG recibe solicitud en /activities/[id]
  → ONG aprueba → status: 'approved'
  → Voluntario ve la actividad en /my-activities como "Próxima"
```

### Flujo D: Registro de asistencia con QR (flujo más crítico)
```
[En el evento - lado ONG]:
  /activities/[id] → "Iniciar actividad" → status: 'in_progress'
  → Botón "Mostrar QR" → redirige a /activities/[id]/qr
  → Pantalla muestra: QR grande, nombre actividad, countdown 30s
  → QR se regenera automáticamente cada 30s (sin recargar)
  → Lista en tiempo real de voluntarios que han escaneado

[En el evento - lado Voluntario]:
  /scan → cámara → escanea QR
  → API valida: token vigente + voluntario aprobado en actividad
  → ✅ "Asistencia registrada — [Nombre actividad]"
  → ⚠️ "Ya registraste tu asistencia"
  → ❌ "QR expirado — pide al organizador que lo muestre de nuevo"
  → ❌ "No estás inscrito en esta actividad"

[Al cerrar actividad - lado ONG]:
  /activities/[id] → "Cerrar actividad" → status: 'completed'
  → Trigger calcula horas automáticamente
  → Notificación de horas sumadas a voluntarios
```

### Flujo E: Perfil del voluntario
```
/profile muestra:
  - Banner con horas totales reales (de volunteer_profiles.total_hours)
  - Nivel calculado con getLevel(totalHours)
  - Barra de progreso con getLevelProgress(totalHours)
  - Desglose de horas por habilidad (de skill_hours)
  - Historial de actividades completadas
  - Habilidades declaradas
```

### Flujo F: Certificados
```
/certificates muestra:
  - Certificados emitidos (status='issued') con botón descargar PDF
  - Certificados en progreso (status='in_progress') con barra de progreso real
  - Se emiten automáticamente al llegar a 10h en una habilidad
```

---

## PÁGINAS A CONSTRUIR/CORREGIR — PRIORIDAD

### PRIORIDAD 1 — Corregir inconsistencias existentes

**1.1 — Arreglar inconsistencia de nivel (Nuevo vs Rookie)**
- Archivo: cualquier componente que use el término "Rookie"
- Acción: reemplazar con la lógica de `lib/utils/levels.ts`
- Verificar: sidebar, perfil, y cualquier otro lugar

**1.2 — Arreglar contador de "Mis Actividades" (muestra 0 pero hay 6 horas)**
- El usuario tiene 6 horas pero "Total registradas: 0" — los datos no están sincronizados
- Verificar que `activity_registrations` tiene registros para este usuario
- Si no los tiene, el cálculo de horas está desconectado del sistema de actividades
- Asegurarse que los contadores consulten la BD real

**1.3 — Arreglar certificados (muestra "Primeros auxilios" 0/10h pero el usuario tiene 6h)**
- "Primeros auxilios" aparece hardcodeado — eliminar completamente
- Los certificados deben venir de la tabla `certificates` en Supabase
- Si no hay habilidades en `skill_hours`, la página debe mostrar el estado vacío correcto

### PRIORIDAD 2 — Construir panel de ONG (actualmente no existe)

**2.1 — `/dashboard` (ONG)**
- Métricas: total actividades, voluntarios únicos, horas generadas, tasa de asistencia
- Lista de actividades próximas y activas
- Acceso rápido a "Nueva actividad"
- Todos los datos deben venir de la BD real

**2.2 — `/activities` (ONG)**
- Lista de todas las actividades de la organización con estado visual
- Filtros: por estado, por fecha
- Botón "Nueva actividad"

**2.3 — `/activities/new` (ONG)**
- Formulario completo con validación Zod
- Campos: título, descripción, habilidades requeridas (tags interactivos), fecha inicio, fecha fin, lugar, máximo voluntarios, público/privado
- Guardar como borrador o publicar directamente

**2.4 — `/activities/[id]` (ONG)**
- Detalles de la actividad
- Lista de voluntarios con solicitudes pendientes de aprobación
- Botones: Aprobar / Rechazar por cada voluntario
- Botón: Cambiar estado (Publicar / Iniciar / Cerrar)
- Acceso a pantalla QR cuando está en progreso

**2.5 — `/activities/[id]/qr` (ONG)**
- QR grande con auto-refresh cada 25s (usando `react-qr-code`)
- Countdown visual de los segundos restantes
- Lista en tiempo real de quién ya escaneó (Supabase Realtime)
- Contador "X de Y voluntarios confirmados han llegado"

**2.6 — `/volunteers` (ONG)**
- Lista de todos los voluntarios que han participado en actividades de la ONG
- Filtros por habilidad
- Card por voluntario con: nombre, habilidades, total de horas en la ONG

**2.7 — `/organization` (ONG)**
- Ver y editar perfil de la organización
- Upload de logo a Supabase Storage

### PRIORIDAD 3 — Completar funcionalidades de voluntario

**3.1 — `/feed/[id]` (Voluntario)**
- Detalle completo de la actividad
- Habilidades requeridas con indicador de match con el perfil del voluntario
- Botón "Solicitar unirme" (crea registro con status: 'pending')
- Si ya está inscrito: mostrar estado actual (Pendiente / Aprobado / etc.)
- Información de la ONG organizadora

**3.2 — `/my-activities` (Voluntario) — ya existe pero necesita datos reales**
- Contadores reales desde la BD (no hardcodeados en 0)
- Lista de actividades con tabs: Próximas / Completadas / Pendientes de aprobación
- Estado visual por cada actividad

**3.3 — `/profile` (Voluntario) — ya existe pero necesita completarse**
- Editar perfil (bio, ciudad, habilidades, universidad, carrera)
- Upload de foto de perfil a Supabase Storage bucket `avatars`
- Desglose de horas por habilidad (componente `HoursBreakdown`)
- Usar `getLevel()` y `getLevelProgress()` del utils

**3.4 — `/certificates` (Voluntario) — ya existe pero está hardcodeado**
- Eliminar "Primeros auxilios" hardcodeado
- Leer desde tabla `certificates` en Supabase
- Mostrar estado vacío correcto si no hay certificados ni horas por habilidad
- Certificados emitidos: descarga PDF (si existe certificate_url) o fallback

---

## COMPONENTES REUTILIZABLES REQUERIDOS

### `EmptyState` — para todos los estados vacíos
```tsx
// Parámetros: emoji, title, description, action (botón opcional)
// Usar en: Feed sin actividades, Mis actividades vacío, etc.
```

### `ActivityCard` — tarjeta de actividad para el feed
```tsx
// Muestra: título, ONG, fecha, habilidades requeridas, cupos disponibles, estado
// Acción: onClick → /feed/[id]
// Estado de inscripción del usuario si aplica
```

### `QRDisplay` — para la pantalla QR de ONG
```tsx
// Auto-refresh cada 25 segundos via polling a GET /api/activities/[id]/qr
// Countdown visual
// No usar localStorage ni sessionStorage
```

### `QRScanner` — para /scan del voluntario
```tsx
// Solicitar permiso de cámara con manejo de error si se niega
// Mostrar instrucciones claras
// Feedback visual y textual del resultado del escaneo
```

---

## API ROUTES — ESPECIFICACIÓN EXACTA

### `GET /api/activities`
- Query params: `skill`, `date`, `search`, `orgId`, `status`
- Retorna: actividades con status='open' para voluntarios; todas las de la ONG para org_admin
- Incluye: nombre de la ONG, count de registrados

### `POST /api/activities`
- Body: `{ title, description, required_skills[], location, start_time, end_time, max_volunteers, is_private }`
- Solo accesible para org_admin
- Retorna: actividad creada

### `POST /api/activities/[id]/register`
- Crea registro con status='pending' (no 'registered' — requiere aprobación)
- Validar: no duplicados, no si está llena (max_volunteers)

### `PATCH /api/activities/[id]/approve`
- Body: `{ volunteer_id, action: 'approve' | 'reject' }`
- Solo accesible para org_admin de la actividad
- Si approve: status → 'approved'
- Si reject: status → 'cancelled'

### `GET /api/activities/[id]/qr`
- Si existe token vigente (expires_at > NOW()): retorna ese token
- Si no existe o expiró: genera nuevo con expires_at = NOW() + 30s
- Retorna: `{ token: string, expiresAt: string }`

### `POST /api/activities/[id]/scan`
- Body: `{ token: string }`
- Valida: token vigente, voluntario con status='approved' en la actividad
- Si válido: inserta en attendance_logs, retorna `{ success: true, activityTitle: string }`
- Si token expirado: retorna `{ error: 'QR_EXPIRED' }`
- Si no inscrito: retorna `{ error: 'NOT_REGISTERED' }`
- Si ya escaneó: retorna `{ error: 'ALREADY_SCANNED' }`

---

## VARIABLES DE ENTORNO

Verificar que existen en `.env.local` y en Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=           # Project URL de Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # Anon/public key
SUPABASE_SERVICE_ROLE_KEY=          # Service role key (solo server-side, nunca cliente)
DATABASE_URL=                        # Connection string PostgreSQL para Prisma
NEXT_PUBLIC_APP_URL=https://tribu-mvp.vercel.app
```

---

## ETAPAS DE EJECUCIÓN (en orden)

### ETAPA 1 — Auditoría y corrección de base
1. Leer y mapear todos los archivos existentes del proyecto
2. Ejecutar el SQL de BD completo en Supabase (tablas faltantes, triggers, RLS)
3. Reorganizar estructura de carpetas según la especificación
4. Crear `lib/utils/levels.ts` con la lógica de niveles
5. Crear `types/index.ts` con todos los tipos del dominio
6. Eliminar "Rookie" del codebase — reemplazar con `getLevel()`
7. Verificar y arreglar el middleware de protección de rutas

**Verificación:** Login funciona, signup funciona, middleware redirige correctamente según rol.

---

### ETAPA 2 — Arreglar páginas de voluntario existentes
1. Arreglar `/my-activities`: contadores reales desde BD
2. Arreglar `/profile`: edición funcional, horas reales, nivel correcto
3. Arreglar `/certificates`: eliminar hardcode, leer desde BD, estado vacío correcto
4. Crear `/feed/[id]`: detalle de actividad con botón "Solicitar unirme"

**Verificación:** Las páginas muestran datos reales (aunque estén vacíos), sin hardcode visible.

---

### ETAPA 3 — Construir panel de ONG
1. Layout de ONG (`app/(org)/layout.tsx`) con sidebar propio
2. `/dashboard`: métricas reales con MetricCard
3. `/activities`: lista con filtros
4. `/activities/new`: formulario completo con validación
5. `/activities/[id]`: gestión de inscripciones, aprobación, cambio de estado
6. `/organization`: perfil de la organización

**Verificación:** Una ONG puede registrarse, crear una organización, crear una actividad y publicarla.

---

### ETAPA 4 — Sistema QR completo
1. `/activities/[id]/qr`: QRDisplay con auto-refresh + lista en tiempo real
2. `/scan`: QRScanner funcional con cámara
3. API routes: GET qr, POST scan con todos los casos de error
4. Supabase Realtime en la lista de asistencia

**Verificación:** ONG muestra QR, voluntario lo escanea desde el celular, asistencia aparece en tiempo real.

---

### ETAPA 5 — Sistema de horas y certificados
1. Verificar que el trigger de cálculo de horas funciona al cerrar actividad
2. Verificar que `skill_hours` se actualiza correctamente
3. Verificar que `certificates` se emite automáticamente al llegar a 10h
4. `/certificates`: mostrar certificados reales con barra de progreso real
5. Generación de PDF básico para certificados emitidos (usando `@react-pdf/renderer`)

**Verificación:** Al cerrar una actividad, las horas se reflejan en el perfil del voluntario.

---

## NOTAS FINALES PARA EL AGENTE

- **Pregunta antes de borrar.** Si un archivo existente parece estar en el lugar equivocado, pregunta antes de eliminarlo.
- **Commits atómicos.** Cada etapa termina con un commit claro: `feat(etapa-1): auditoría y corrección de base`.
- **No inventes datos.** Si la BD está vacía, muestra el estado vacío correcto. Nunca seed data en producción sin avisar.
- **Reporta bloqueos.** Si un paso no funciona como esperado, detente y reporta el error completo antes de continuar.
- **Vercel deploy en cada etapa.** Cada etapa debe ser deployable y verificada en producción antes de pasar a la siguiente.

---

*TRIBU Agent Prompt v2.0 — Preparado para Hackathon 2026*
*Gabriel Caraballo — Responsable de Operaciones y Producto*

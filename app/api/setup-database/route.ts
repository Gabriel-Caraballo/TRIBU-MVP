// app/api/setup-database/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Esta ruta configura la base de datos con todas las tablas y políticas necesarias
export async function GET(req: NextRequest) {
  try {
    // 1. Verificar si la tabla user_profiles existe
    const { data: tablesData, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_profiles')
      .limit(1);

    if (tablesError) {
      console.error('Error verificando existencia de tabla:', tablesError);
      return NextResponse.json({ error: tablesError.message }, { status: 500 });
    }

    // Si la tabla ya existe, no continuar
    if (tablesData && tablesData.length > 0) {
      return NextResponse.json({ message: 'Database already set up' }, { status: 200 });
    }

    // 2. Crear extensiones necesarias
    const { data: extensionsData, error: extensionsError } = await supabaseAdmin.rpc('extensions', {
      extensions: ['uuid-ossp']
    });

    if (extensionsError) {
      console.error('Error creando extensiones:', extensionsError);
      return NextResponse.json({ error: extensionsError.message }, { status: 500 });
    }

    // 3. Crear tablas y policies usando SQL ejecutado directamente desde el dashboard
    return NextResponse.json({ 
      message: 'Por favor, ejecute el script SQL manualmente en el Dashboard de Supabase -> SQL Editor',
      sql: `
-- 1. Crear tabla user_profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  account_type TEXT NOT NULL CHECK (account_type IN ('org_admin', 'volunteer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Crear tabla organizations
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  owner_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Crear tabla volunteer_profiles
CREATE TABLE IF NOT EXISTS public.volunteer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  university TEXT,
  career TEXT,
  total_hours NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Crear tabla org_members
CREATE TABLE IF NOT EXISTS public.org_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'coordinator')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(org_id, user_id)
);

-- 5. Crear trigger para crear perfil de usuario automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE PLPGSQL SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, account_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'volunteer')
  );
  
  -- Si es volunteer, crear perfil de voluntario
  IF COALESCE(NEW.raw_user_meta_data->>'account_type', 'volunteer') = 'volunteer' THEN
    INSERT INTO public.volunteer_profiles (user_id) 
    VALUES (NEW.id);
  END IF;
  
  -- Si es org_admin y hay org_name, crear organización y miembro
  IF COALESCE(NEW.raw_user_meta_data->>'account_type', '') = 'org_admin' AND 
     NEW.raw_user_meta_data->>'org_name' IS NOT NULL AND 
     NEW.raw_user_meta_data->>'org_name' != '' THEN
    
    -- Crear organización
    WITH new_org AS (
      INSERT INTO public.organizations (name, owner_id) 
      VALUES (NEW.raw_user_meta_data->>'org_name', NEW.id)
      RETURNING id
    )
    -- Crear miembro de la organización
    INSERT INTO public.org_members (org_id, user_id, role)
    SELECT id, NEW.id, 'admin' FROM new_org;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Activar RLS en todas las tablas
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

-- 7. Crear políticas RLS básicas
-- user_profiles: cada usuario ve su perfil
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);
  
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);
  
-- organizations: owner puede hacer todo
CREATE POLICY "Anyone authenticated can read organizations"
  ON public.organizations FOR SELECT
  TO authenticated USING (true);
  
CREATE POLICY "Owner can manage organization"
  ON public.organizations FOR ALL
  USING (auth.uid() = owner_id);
  
-- volunteer_profiles: el voluntario gestiona el suyo
CREATE POLICY "Volunteer can manage own profile"
  ON public.volunteer_profiles FOR ALL
  USING (auth.uid() = user_id);
  
CREATE POLICY "Anyone can read volunteer profiles"
  ON public.volunteer_profiles FOR SELECT
  TO authenticated USING (true);
  
-- org_members: miembros pueden ver su membresía
CREATE POLICY "Members can see their memberships"
  ON public.org_members FOR SELECT
  USING (auth.uid() = user_id);
      `
    }, { status: 200 });

  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json({ error: 'Failed to set up database' }, { status: 500 });
  }
}
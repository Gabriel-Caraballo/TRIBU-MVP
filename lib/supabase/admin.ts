// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js';

// Este cliente usa la service_role_key y solo debe ser usado en el servidor
// Tiene permisos administrativos completos para operaciones de backend
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
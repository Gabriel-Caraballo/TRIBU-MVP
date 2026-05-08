// app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    
    if (!code) {
      return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=missing_code`);
    }
    
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );
    
    // Intercambiar el code por una sesión
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("Error en intercambio de código:", error.message);
      return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=${encodeURIComponent(error.message)}`);
    }
    
    // Si el intercambio fue exitoso, obtener el tipo de cuenta
    if (data?.session?.user) {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('account_type')
        .eq('id', data.session.user.id)
        .single();
      
      if (profileError) {
        console.error("Error obteniendo perfil:", profileError.message);
        return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=profile_error`);
      }
      
      if (profile?.account_type === 'org_admin') {
        return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
      } else if (profile?.account_type === 'volunteer') {
        return NextResponse.redirect(`${requestUrl.origin}/feed`);
      }
    }
    
    // Si no se pudo determinar el tipo de cuenta, redirigir a la página principal
    return NextResponse.redirect(`${requestUrl.origin}/`);
  } catch (error) {
    console.error('Error en el callback de autenticación:', error);
    return NextResponse.redirect(`${request.nextUrl.origin}/auth/login?error=server_error`);
  }
}
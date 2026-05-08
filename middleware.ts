// middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas que no requieren autenticación
const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/register', '/auth/callback', '/auth/verify', '/auth/forgot-password', '/api/setup-database'];

// Rutas que requieren ser ONG admin
const ORG_ADMIN_ROUTES = ['/dashboard', '/activities', '/volunteers', '/reports'];

// Rutas que requieren ser voluntario
const VOLUNTEER_ROUTES = ['/feed', '/scan', '/profile', '/certificates', '/my-activities'];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const url = request.nextUrl.pathname;

  // Para desarrollo, permitir todas las rutas
  if (process.env.NODE_ENV === 'development') {
    return response;
  }

  // Comprobar si la ruta es pública
  const isPublicRoute = PUBLIC_ROUTES.some(route => {
    if (route === '/') {
      return url === '/';
    }
    return url.startsWith(route);
  });

  // Si la ruta es pública, permitir acceso
  if (isPublicRoute) {
    // Si el usuario está autenticado y está intentando acceder a login/register
    if (session && (url === '/auth/login' || url === '/auth/register')) {
      // Obtener el tipo de cuenta del usuario
      const { data: user } = await supabase
        .from('user_profiles')
        .select('account_type')
        .eq('id', session.user.id)
        .single();

      if (user?.account_type === 'org_admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else if (user?.account_type === 'volunteer') {
        return NextResponse.redirect(new URL('/feed', request.url));
      }
    }

    return response;
  }

  // Comprobar si la ruta requiere autenticación
  const isOrgAdminRoute = ORG_ADMIN_ROUTES.some(route => url.startsWith(route));
  const isVolunteerRoute = VOLUNTEER_ROUTES.some(route => url.startsWith(route));

  // Si la ruta requiere autenticación y el usuario no está autenticado
  if ((isOrgAdminRoute || isVolunteerRoute) && !session) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Si el usuario está autenticado pero intenta acceder a una ruta para la que no tiene permisos
  if (session) {
    const { data: user } = await supabase
      .from('user_profiles')
      .select('account_type')
      .eq('id', session.user.id)
      .single();

    if (isOrgAdminRoute && user?.account_type !== 'org_admin') {
      // Redirigir a feed si es voluntario intentando acceder a rutas de ONG
      if (user?.account_type === 'volunteer') {
        return NextResponse.redirect(new URL('/feed', request.url));
      }
      // Redirigir a login en cualquier otro caso
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    if (isVolunteerRoute && user?.account_type !== 'volunteer') {
      // Redirigir a dashboard si es admin intentando acceder a rutas de voluntario
      if (user?.account_type === 'org_admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      // Redirigir a login en cualquier otro caso
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return response;
}
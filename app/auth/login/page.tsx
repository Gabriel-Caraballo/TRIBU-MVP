// app/auth/login/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthCard from '@/app/components/auth/AuthCard';
import FormField from '@/app/components/auth/FormField';
import PasswordInput from '@/app/components/auth/PasswordInput';
import { createClient } from '@/lib/supabase/client';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Ingresa un email válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación con Zod
    try {
      loginSchema.parse({ email, password });
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convertir los errores de Zod en un formato más amigable
        const formattedErrors: Record<string, string> = {};
        error.format();  // Asegurarse de que el error esté formateado
        error.issues.forEach(err => {
          if (err.path.length) {
            formattedErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(formattedErrors);
        return;
      }
    }

    setIsLoading(true);
    setAuthError('');

    // Iniciar sesión con Supabase
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Traducir errores comunes de Supabase
        if (error.message.includes('Invalid login credentials')) {
          setAuthError('Email o contraseña incorrectos');
        } else if (error.message.includes('Email not confirmed')) {
          setAuthError('Debes verificar tu email antes de iniciar sesión');
        } else {
          setAuthError(error.message);
        }
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Redirigir según el tipo de cuenta
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Error al obtener perfil:', profileError);
          setAuthError('Error al obtener tu perfil. Intenta nuevamente.');
          setIsLoading(false);
          return;
        }

        if (profile) {
          console.log('[LOGIN] Redirect decision:', {
            role: profile.role,
            userId: data.user.id
          });

          if (profile.role === 'org_admin') {
            console.log('[LOGIN] Redirecting to /dashboard');
            router.push('/dashboard');
          } else if (profile.role === 'volunteer') {
            console.log('[LOGIN] Redirecting to /feed');
            router.push('/feed');
          } else {
            // Si no hay tipo de cuenta válido, redirigir a la página principal
            console.log('[LOGIN] Unknown account_type, redirecting to /');
            router.push('/');
          }
        } else {
          setAuthError('No se encontró un perfil asociado a tu cuenta.');
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      setAuthError('Ocurrió un error al iniciar sesión. Intenta de nuevo.');
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title="Iniciar Sesión">
      {/* Alerta de Error - Ahora más integrada */}
      {authError && (
        <div className="flex items-center gap-3 bg-red-500/10 border-l-2 border-red-500 text-red-200 p-4 mb-6 text-xs rounded-r-xl animate-in fade-in slide-in-from-top-2 duration-300">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium tracking-wide">{authError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campo de Email */}
        <FormField
          id="email"
          label="Correo Electrónico"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
          autoComplete="email"
          // Eliminamos las clases de bg aquí porque ya las maneja internamente FormField.tsx
          className="w-full"
        />

        {/* Campo de Contraseña */}
        <div className="space-y-1">
          <PasswordInput
            id="password"
            label="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
            autoComplete="current-password"
            className="w-full"
          />
          <div className="flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/20 hover:text-[--tribu-green] transition-all"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`relative w-full py-4 bg-[--tribu-green] hover:bg-[--tribu-green]/90 text-black text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all active:scale-[0.97] shadow-[0_0_20px_rgba(var(--tribu-green-rgb),0.2)] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Verificando...</span>
            </div>
          ) : (
            "Entrar a la Tribu"
          )}
        </button>
      </form>

      {/* Divisor Visual */}
      <div className="mt-12 text-center relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-white/5"></div>
        </div>
        <div className="relative flex justify-center text-[9px] uppercase tracking-[0.4em] font-bold">
          <span className="bg-transparent backdrop-blur-md px-4 text-white/10 italic">
            Membresía
          </span>
        </div>

        <p className="mt-8 text-[11px] text-white/30 uppercase tracking-widest font-medium">
          ¿Aún no eres miembro?{' '}
          <Link
            href="/auth/register"
            className="text-[--tribu-green] font-black hover:text-white transition-colors ml-1 underline decoration-white/10 underline-offset-4"
          >
            Únete ahora
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}

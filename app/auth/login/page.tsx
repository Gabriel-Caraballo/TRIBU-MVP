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
    <AuthCard title="[ INICIAR_SESIÓN ]">
      {authError && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 mb-6 text-xs tracking-wide font-mono">
          {authError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
        />
        
        <PasswordInput
          id="password"
          label="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
        />
        
        <div className="text-right mt-2">
          <Link href="/auth/forgot-password" className="text-[10px] tracking-widest uppercase text-[#8a8a82] hover:text-[--tribu-green] transition-colors">
            [ OLVIDÉ MI CONTRASEÑA ]
          </Link>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`btn btn-primary w-full mt-4 ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V2C5.373 2 2 5.373 2 12h2zm8 4l-2-2 2-2 2 2-2 2z"></path>
              </svg>
              Iniciando sesión...
            </div>
          ) : 'Iniciar sesión'}
        </button>
      </form>
      
      <div className="mt-8 text-center border-t border-white/10 pt-6">
        <p className="text-[10px] text-[#8a8a82] uppercase tracking-widest">
          ¿No tienes cuenta?{' '}
          <Link href="/auth/register" className="text-[--tribu-green] font-bold hover:text-[#e8e8e2] transition-colors ml-2">
            Regístrate aquí &rarr;
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
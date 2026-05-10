// app/auth/forgot-password/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import AuthCard from '@/app/components/auth/AuthCard';
import FormField from '@/app/components/auth/FormField';
import { createClient } from '@/lib/supabase/client';
import { z } from 'zod';

const forgotSchema = z.object({
  email: z.string().email('Ingresa un email válido')
});

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación con Zod
    try {
      forgotSchema.parse({ email });
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
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

    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      // Siempre mostrar éxito, incluso si el email no existe, para evitar enumeración
      setIsSuccess(true);
    } catch (error) {
      console.error('Error al enviar email de recuperación:', error);
      // No mostrar error para evitar enumeración de usuarios
      setIsSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthCard title="Email enviado">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-[--tribu-green-light] rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-[--tribu-green]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[--tribu-dark]">
              Si ese email existe en nuestra base de datos, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
            </p>

            <p className="text-[--tribu-gray] text-sm">
              Recuerda revisar tu carpeta de spam si no lo encuentras.
            </p>
          </div>

          <div className="pt-4">
            <Link href="/auth/login" className="text-[--tribu-blue] hover:underline font-medium">
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Recuperar contraseña">
      <p className="text-[--tribu-gray] text-center mb-6">
        Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
      </p>

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

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-[--tribu-blue] hover:bg-[--tribu-navy] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--tribu-blue] transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
        >
          {isLoading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V2C5.373 2 2 5.373 2 12h2zm8 4l-2-2 2-2 2 2-2 2z"></path>
              </svg>
              Enviando...
            </div>
          ) : 'Enviar enlace'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/auth/login" className="text-[--tribu-blue] hover:underline font-medium text-sm">
          ← Volver a inicio de sesión
        </Link>
      </div>
    </AuthCard>
  );
}
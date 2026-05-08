// app/auth/register/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthCard from '@/app/components/auth/AuthCard';
import FormField from '@/app/components/auth/FormField';
import PasswordInput from '@/app/components/auth/PasswordInput';
import AccountTypeSelector from '@/app/components/auth/AccountTypeSelector';
import { createClient } from '@/lib/supabase/client';
import { z } from 'zod';

// Esquema para validación básica
const baseSchema = z.object({
  fullName: z.string().min(3, 'El nombre completo es requerido'),
  email: z.string().email('Ingresa un email válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

// Esquema para ONG (requiere nombre de organización)
const orgSchema = baseSchema.extend({
  orgName: z.string().min(3, 'El nombre de tu organización es requerido')
});

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<'org_admin' | 'volunteer' | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    orgName: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const supabase = createClient();

  const handleAccountTypeSelect = (type: 'org_admin' | 'volunteer') => {
    setAccountType(type);
    setStep(2);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación con Zod
    try {
      if (accountType === 'org_admin') {
        orgSchema.parse(formData);
      } else {
        baseSchema.parse(formData);
      }
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

    try {
      // Registrar usuario con Supabase
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            account_type: accountType,
            org_name: accountType === 'org_admin' ? formData.orgName : undefined
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        if (error.message.includes('email already')) {
          setAuthError('Este email ya está registrado. Por favor, intenta con otro o inicia sesión.');
        } else {
          setAuthError(error.message);
        }
        return;
      }

      // Redirigir a la página de verificación
      router.push('/auth/verify');

    } catch (error) {
      console.error('Error de registro:', error);
      setAuthError('Ocurrió un error al registrarte. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title="Crear cuenta">
      {step === 1 && (
        <div>
          <p className="text-[--tribu-gray] text-center mb-6">Selecciona el tipo de cuenta que deseas crear</p>
          
          <AccountTypeSelector 
            onSelect={handleAccountTypeSelect}
            selected={accountType || undefined}
          />
        </div>
      )}

      {step === 2 && (
        <>
          {authError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
              {authError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              id="fullName"
              label="Nombre completo"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
              required
            />
            
            <FormField
              id="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />
            
            {accountType === 'org_admin' && (
              <FormField
                id="orgName"
                label="Nombre de tu organización"
                value={formData.orgName}
                onChange={handleChange}
                error={errors.orgName}
                required
              />
            )}
            
            <PasswordInput
              id="password"
              label="Contraseña"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />
            
            <PasswordInput
              id="confirmPassword"
              label="Confirmar contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
            />
            
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[--tribu-blue] hover:underline focus:outline-none text-sm"
              >
                ← Volver
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`flex justify-center py-3 px-8 border border-transparent rounded-md shadow-sm text-white bg-[--tribu-blue] hover:bg-[--tribu-navy] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--tribu-blue] transition-colors ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V2C5.373 2 2 5.373 2 12h2zm8 4l-2-2 2-2 2 2-2 2z"></path>
                    </svg>
                    Registrando...
                  </div>
                ) : 'Registrarme'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-[--tribu-gray]">
              ¿Ya tienes cuenta?{' '}
              <Link href="/auth/login" className="text-[--tribu-blue] hover:underline font-medium">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </>
      )}
    </AuthCard>
  );
}
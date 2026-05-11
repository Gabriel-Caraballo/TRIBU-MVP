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

// Esquemas de validación (fuera del componente para evitar re-creaciones)
const registerSchema = z.object({
  fullName: z.string().min(3, 'El nombre completo es requerido'),
  email: z.string().email('Ingresa un email válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string(),
  orgName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  // Estados
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

  // Manejadores
  const handleAccountTypeSelect = (type: 'org_admin' | 'volunteer') => {
    setAccountType(type);
    setStep(2);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    // Limpiar error del campo cuando el usuario escribe
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: '' }));
  };

  const validate = () => {
    try {
      registerSchema.parse(formData);

      // Validación extra manual para ONG
      if (accountType === 'org_admin' && (!formData.orgName || formData.orgName.length < 3)) {
        setErrors({ orgName: 'El nombre de tu organización es requerido' });
        return false;
      }

      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.issues.forEach(err => {
          if (err.path.length) formattedErrors[err.path[0].toString()] = err.message;
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setAuthError('');

    try {
      const { error } = await supabase.auth.signUp({
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
        setAuthError(error.message.includes('already registered')
          ? 'Este email ya está registrado'
          : error.message);
        return;
      }

      router.push('/auth/verify');
    } catch (err) {
      setAuthError('Error en el servidor. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title="Crear Cuenta">
      {step === 1 ? (
        <div className="animate-in fade-in duration-500">
          <p className="text-[#8a8a82] text-[10px] uppercase tracking-[0.2em] text-center mb-8 font-bold">
            Selecciona tu rol en la tribu
          </p>

          <AccountTypeSelector
            onSelect={handleAccountTypeSelect}
            selected={accountType || undefined}
          />

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-[11px] text-white/30 uppercase tracking-widest font-medium">
              ¿Ya tienes cuenta?{' '}
              <Link href="/auth/login" className="text-[--tribu-green] font-black hover:text-white transition-colors ml-1 underline underline-offset-4 decoration-white/10">
                Inicia Sesión
              </Link>
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 animate-in slide-in-from-right-8 duration-500">
          {authError && (
            <div className="flex items-center gap-3 bg-red-500/10 border-l-2 border-red-500 text-red-200 p-4 mb-6 text-xs rounded-r-xl">
              <span className="font-medium tracking-wide">{authError}</span>
            </div>
          )}

          <FormField
            id="fullName"
            label="Nombre Completo"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
            required
          />

          <FormField
            id="email"
            label="Correo Electrónico"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />

          {accountType === 'org_admin' && (
            <FormField
              id="orgName"
              label="Nombre de la Organización"
              value={formData.orgName}
              onChange={handleChange}
              error={errors.orgName}
              required
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              label="Confirmar"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 hover:text-[--tribu-green] transition-all"
            >
              &larr; Volver
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className={`py-4 px-8 bg-[--tribu-green] hover:bg-[--tribu-green]/90 text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all active:scale-[0.97] shadow-[0_0_20px_rgba(var(--tribu-green-rgb),0.2)] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            >
              {isLoading ? 'Registrando...' : 'Unirse a la Tribu'}
            </button>
          </div>
        </form>
      )}
    </AuthCard>
  );
}

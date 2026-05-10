// app/auth/verify/page.tsx
"use client";

import Link from 'next/link';
import AuthCard from '@/app/components/auth/AuthCard';

export default function VerifyEmailPage() {
  return (
    <AuthCard title="Verificación de Email">
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
            Hemos enviado un enlace de verificación a tu email.
          </p>

          <p className="text-[--tribu-gray] text-sm">
            Por favor, revisa tu bandeja de entrada y haz clic en el enlace para verificar tu cuenta.
            Si no lo encuentras, revisa también tu carpeta de spam.
          </p>
        </div>

        <div className="pt-4">
          <Link href="/auth/login" className="text-[--tribu-blue] hover:underline font-medium">
            Volver a inicio de sesión
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}
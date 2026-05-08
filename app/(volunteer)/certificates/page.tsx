// app/(volunteer)/certificates/page.tsx
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Certificate {
  id: string;
  skill: string;
  hours_required: number;
  hours_completed: number;
  issued_at: string | null;
  status: string;
}

export default function CertificatesPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    fetchCertificates();
  }, []);

  async function fetchCertificates() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: certs } = await supabase
        .from('certificates')
        .select('*')
        .eq('volunteer_id', session.user.id)
        .order('skill', { ascending: true });

      setCertificates(certs || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  }

  function calculateProgress(completed: number, required: number): number {
    if (required === 0) return 100;
    return Math.min(100, Math.round((completed / required) * 100));
  }

  function getProgressColor(progress: number): string {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-[--tribu-blue]';
    if (progress >= 50) return 'bg-[--tribu-orange]';
    return 'bg-gray-300';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[--tribu-blue]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[--tribu-navy]">Mis Certificados</h1>
        <Link href="/profile" className="text-sm text-[--tribu-blue] hover:underline">
          Ver perfil →
        </Link>
      </div>

      <div className="bg-gradient-to-r from-[--tribu-blue] to-[--tribu-navy] rounded-xl p-6 text-white">
        <h2 className="font-bold text-lg">¿Cómo funciona?</h2>
        <p className="text-blue-100 mt-2 text-sm">
          Acumula 10 horas validadas en cada habilidad para recibir un certificado.
          Las horas se acreditan cuando las organizaciones completan las actividades.
        </p>
      </div>

      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => {
            const progress = calculateProgress(Number(cert.hours_completed), Number(cert.hours_required));
            
            return (
              <div 
                key={cert.id} 
                className={`bg-white rounded-lg shadow-md overflow-hidden ${
                  cert.status === 'issued' ? 'ring-2 ring-green-500' : ''
                }`}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-[--tribu-navy]">{cert.skill}</h3>
                    {cert.status === 'issued' ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                        Emitido
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                        En progreso
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[--tribu-gray]">Progreso</span>
                      <span className="font-medium">
                        {cert.hours_completed || 0}/{cert.hours_required || 10} horas
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getProgressColor(progress)} rounded-full transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {cert.issued_at && (
                    <p className="text-xs text-[--tribu-gray] mt-3">
                      Emitido: {new Date(cert.issued_at).toLocaleDateString('es-DO')}
                    </p>
                  )}

                  {cert.status === 'issued' && (
                    <button className="mt-4 w-full py-2 bg-[--tribu-blue] text-white rounded-lg text-sm font-medium hover:bg-[--tribu-navy]">
                      Descargar PDF
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Sin certificados aún</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
            Completa actividades y acumula horas para recibir tus primeros certificados.
            Cada skill requiere 10 horas validadas.
          </p>
        </div>
      )}

      {/* Habilidades sin certificado aún */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-bold text-[--tribu-navy] mb-4">Habilidades disponibles</h3>
        <p className="text-sm text-[--tribu-gray]">
          Cuando acumules 10 horas en una habilidad que no tengas certificado,
          se emitirá automáticamente.
        </p>
      </div>
    </div>
  );
}
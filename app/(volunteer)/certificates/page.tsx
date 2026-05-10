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
    if (progress >= 100) return 'bg-[#22c55e]';
    if (progress >= 75) return 'bg-[#22c55e]';
    if (progress >= 50) return 'bg-[#f59e0b]';
    return 'bg-[#333]';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#22c55e]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 min-h-screen bg-[#0a0a0a]">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Mis Certificados</h1>
        <Link href="/profile" className="text-sm text-[#22c55e] hover:underline">
          Ver perfil →
        </Link>
      </div>

      <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-6">
        <h2 className="font-bold text-lg text-white">¿Cómo funciona?</h2>
        <p className="text-[#555] mt-2 text-sm">
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
                className={`bg-[#111] rounded-lg border border-[#1f1f1f] overflow-hidden ${
                  cert.status === 'issued' ? 'ring-2 ring-[#22c55e]' : ''
                }`}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-white">{cert.skill}</h3>
                    {cert.status === 'issued' ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-[rgba(34,197,94,0.1)] text-[#22c55e] font-medium border border-[rgba(34,197,94,0.2)]">
                        Emitido
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-[rgba(245,158,11,0.1)] text-[#f59e0b] font-medium border border-[rgba(245,158,11,0.2)]">
                        En progreso
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#555]">Progreso</span>
                      <span className="font-medium text-white">
                        {cert.hours_completed || 0}/{cert.hours_required || 10} horas
                      </span>
                    </div>
                    <div className="h-3 bg-[#1f1f1f] rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getProgressColor(progress)} rounded-full transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {cert.issued_at && (
                    <p className="text-xs text-[#555] mt-3">
                      Emitido: {new Date(cert.issued_at).toLocaleDateString('es-DO')}
                    </p>
                  )}

                  {cert.status === 'issued' && (
                    <button className="mt-4 w-full py-2 bg-[#22c55e] text-black rounded-lg text-sm font-bold hover:bg-[#16a34a]">
                      Descargar PDF
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-[#111] rounded-lg border border-[#1f1f1f]">
          <svg className="mx-auto h-12 w-12 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-white">Sin certificados aún</h3>
          <p className="mt-2 text-sm text-[#555] max-w-sm mx-auto">
            Completa actividades y acumula horas para recibir tus primeros certificados.
            Cada skill requiere 10 horas validadas.
          </p>
        </div>
      )}

      {/* Habilidades sin certificado aún */}
      <div className="bg-[#111] rounded-lg border border-[#1f1f1f] p-6">
        <h3 className="font-bold text-white mb-4">Habilidades disponibles</h3>
        <p className="text-sm text-[#555]">
          Cuando acumules 10 horas en una habilidad que no tengas certificado,
          se emitirá automáticamente.
        </p>
      </div>
    </div>
  );
}
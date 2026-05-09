// components/landing/ForWhom.tsx
// Sección que muestra para quién está diseñado TRIBU: ONGs y Voluntarios

"use client";

import Link from 'next/link';

export const ForWhom = () => {
  const forOngsBenefits = [
    'Reduce el tiempo de coordinación un 70%',
    'Encuentra el voluntario exacto para cada misión',
    'Reportes de impacto listos para presentar',
    'Gestiona múltiples actividades simultáneas',
    'Banco de talento que crece con cada actividad'
  ];
  
  const forVolunteersBenefits = [
    'Certificados de habilidades con valor real',
    'Historial verificable para tu CV',
    'Encuentra causas que van con tu perfil',
    'Completa tus horas de labor social universitaria',
    'Construye tu reputación social'
  ];
  
  return (
    <section id="for-whom" className="py-24 md:py-32 bg-[#0a0a09] text-[#e8e8e2] font-mono border-b border-white/10">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-[#8a8a82] uppercase mb-16">
          <span className="text-[--tribu-green]">#</span> PARA QUIÉN
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-12 lg:gap-24 mb-16">
          <h2 className="text-4xl md:text-5xl font-sans uppercase tracking-wide leading-[1.1] font-bold">
            Diseñado para <em className="bg-[#e8e8e2] text-[#0a0a09] px-2 not-italic inline-block">dos mundos</em>.
          </h2>

          <div className="flex flex-col gap-6">
            {/* Item 1: ONGs (Verde) */}
            <div className="bg-[#111110] border border-white/10 border-l-4 border-l-[--tribu-green] rounded-lg p-6 md:p-8 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-6 md:gap-8 mb-6">
                <span className="text-xs tracking-[0.25em] text-[--tribu-green] font-medium">#01</span>
                <h3 className="text-2xl md:text-3xl font-sans uppercase tracking-wide flex-1 m-0">Para ONGs</h3>
              </div>
              <div className="pl-0 md:pl-[52px]">
                <p className="text-xs text-[#8a8a82] leading-loose mb-6 max-w-2xl">
                  Deja de administrar, empieza a ejecutar. Menos Excel, más impacto real.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {forOngsBenefits.map((benefit, i) => (
                    <div key={i} className="bg-white/5 border border-[--tribu-green]/20 rounded p-4 flex flex-col gap-2">
                      <span className="text-[10px] tracking-widest uppercase text-[--tribu-green]">Métrica 0{i+1}</span>
                      <span className="text-[11px] text-[#e8e8e2]">{benefit}</span>
                    </div>
                  ))}
                </div>
                <Link href="/auth/register" className="inline-block border-b-2 border-[--tribu-green] text-[#e8e8e2] text-[10px] tracking-widest uppercase pb-1 hover:text-[--tribu-green] transition-colors">
                  Registra tu ONG &rarr;
                </Link>
              </div>
            </div>
              
            {/* Item 2: Voluntarios (Azul) */}
            <div className="bg-[#111110] border border-white/10 border-l-4 border-l-[--tribu-blue] rounded-lg p-6 md:p-8 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-6 md:gap-8 mb-6">
                <span className="text-xs tracking-[0.25em] text-[--tribu-blue] font-medium">#02</span>
                <h3 className="text-2xl md:text-3xl font-sans uppercase tracking-wide flex-1 m-0">Para Voluntarios</h3>
              </div>
              <div className="pl-0 md:pl-[52px]">
                <p className="text-xs text-[#8a8a82] leading-loose mb-6 max-w-2xl">
                  Tu tiempo vale. Construye tu reputación profesional mientras ayudas.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {forVolunteersBenefits.map((benefit, i) => (
                    <div key={i} className="bg-white/5 border border-[--tribu-blue]/20 rounded p-4 flex flex-col gap-2">
                      <span className="text-[10px] tracking-widest uppercase text-[--tribu-blue]">Benefit 0{i+1}</span>
                      <span className="text-[11px] text-[#e8e8e2]">{benefit}</span>
                    </div>
                  ))}
                </div>
                <Link href="/auth/register" className="inline-block border-b-2 border-[--tribu-blue] text-[#e8e8e2] text-[10px] tracking-widest uppercase pb-1 hover:text-[--tribu-blue] transition-colors">
                  Únete ahora &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForWhom;
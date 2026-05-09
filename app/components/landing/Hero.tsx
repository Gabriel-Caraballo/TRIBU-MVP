// components/landing/Hero.tsx
// Sección principal hero con gradiente animado, copy principal y mockup del dashboard

"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export const Hero = () => {
  const [phase, setPhase] = useState<'scanning' | 'success' | 'app'>('scanning');

  // Secuencia de animación del celular
  useEffect(() => {
    const cycle = () => {
      setPhase('scanning');
      // A los 3 segundos, encuentra el QR y muestra éxito
      setTimeout(() => setPhase('success'), 3000);
      // 1.5 segundos después, abre la app
      setTimeout(() => setPhase('app'), 4500); 
    };
    
    cycle();
    // Se repite todo el ciclo cada 9 segundos
    const interval = setInterval(cycle, 9000); 
    
    return () => clearInterval(interval);
  }, []);

  return (
    <>
    <style>{`
      @keyframes scanLine {
        0%, 100% { transform: translateY(0); opacity: 0; }
        10%, 90% { opacity: 1; }
        50% { transform: translateY(160px); }
      }
      .animate-scan-line {
        animation: scanLine 2s ease-in-out infinite;
      }
    `}</style>
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#0a0a09] text-[#e8e8e2] font-mono border-b border-white/10">
      
      <div className="container relative z-10 mx-auto px-4 pt-32 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center max-w-6xl">

        {/* Columna Izquierda: Copy + CTAs */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1 z-20">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-sans uppercase tracking-tighter leading-[1] mb-6 max-w-3xl font-black flex flex-wrap items-end justify-center lg:justify-start gap-y-3">
              <span className="inline-block transform scale-y-110 origin-bottom mr-2">El impacto real no se mide en</span>
              <em className="inline-flex not-italic border-t-2 border-l-2 border-[#107c41] bg-[#f3f2f1] shadow-[4px_4px_0px_#107c41] ml-2">
                {['E', 'X', 'C', 'E', 'L'].map((letter, i) => (
                  <span key={i} className="flex items-center justify-center w-6 h-8 md:w-8 md:h-10 border-b-2 border-r-2 border-[#107c41] text-[#107c41] font-black text-lg md:text-xl font-mono">
                    {letter}
                  </span>
                ))}
              </em>.
            </h1>
            <p className="text-sm md:text-base text-[#8a8a82] leading-relaxed max-w-xl text-center lg:text-left">
              Así nace <strong className="text-[--tribu-green]">TRIBU</strong>. La plataforma que profesionaliza, mide y valida el voluntariado social para que tu impacto deje de ser invisible.
            </p>
          </div>

          {/* CTAs Minimalistas Monospace */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 text-xs font-bold tracking-widest uppercase bg-[--tribu-green] text-white px-10 py-5 hover:bg-[#e8e8e2] hover:text-[#0a0a09] transition-colors duration-300"
            >
              Comenzar gratis
            </Link>
            <Link
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 text-xs font-bold tracking-widest uppercase bg-[#111110] text-[#e8e8e2] border border-white/10 px-10 py-5 hover:text-white hover:border-white/30 transition-colors duration-300"
            >
              Ver cómo funciona
            </Link>
          </div>
        </div>

        {/* Columna Derecha: Phone Mockup Animation */}
        <div className="flex justify-center lg:justify-center order-1 lg:order-2 w-full z-10 relative">
          {/* Contenedor del Celular con rotación y traslación */}
          <div className="relative w-[260px] h-[540px] border-[8px] border-[#2a2a28] rounded-[3rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col bg-[#111110] ring-1 ring-white/5 transform lg:rotate-[12deg] lg:-translate-y-12 lg:-translate-x-4 hover:rotate-0 transition-transform duration-700 ease-out">
            
            {/* Notch del Celular */}
            <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
              <div className="w-24 h-5 bg-[#2a2a28] rounded-b-2xl"></div>
            </div>

            {/* Fase 1: Escaneando */}
            <div className={`absolute inset-0 transition-opacity duration-300 ${phase === 'scanning' ? 'opacity-100 z-10' : 'opacity-0 z-0'} flex flex-col items-center justify-center bg-black/90`}>
              <div className="text-white/50 text-xs mb-8 uppercase tracking-widest">Escaneando QR...</div>
              <div className="relative w-48 h-48 border-2 border-white/10 rounded-xl flex items-center justify-center">
                {/* Esquinas del escáner */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#22c55e] rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#22c55e] rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#22c55e] rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#22c55e] rounded-br-lg"></div>
                
                {/* Mock de Código QR */}
                <div className="w-28 h-28 bg-white/20 rounded p-2 flex flex-wrap gap-1">
                  <div className="w-full h-full border-4 border-dashed border-white/30"></div>
                </div>
                
                {/* Línea láser de escaneo */}
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-[--tribu-green] shadow-[0_0_15px_var(--tribu-green)] animate-scan-line"></div>
              </div>
            </div>

            {/* Fase 2: Éxito */}
            <div className={`absolute inset-0 transition-opacity duration-300 ${phase === 'success' ? 'opacity-100 z-10' : 'opacity-0 z-0'} flex flex-col items-center justify-center bg-[--tribu-green]`}>
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl scale-in-center">
                <svg className="w-10 h-10 text-[--tribu-green]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-white font-sans font-bold text-xl uppercase tracking-wider">Asistencia</h3>
              <h3 className="text-white font-sans font-bold text-xl uppercase tracking-wider">Validada</h3>
            </div>

            {/* Fase 3: Dashboard en App */}
            <div className={`absolute inset-0 transition-opacity duration-500 ${phase === 'app' ? 'opacity-100 z-10' : 'opacity-0 z-0'} flex flex-col bg-white`}>
              <div className="pt-10 pb-6 px-6 bg-[#0a0a09] text-white rounded-b-[2rem] shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-serif font-bold text-lg tracking-wider">TRIBU</span>
                  <div className="w-7 h-7 rounded-full bg-[--tribu-green] text-white flex items-center justify-center font-bold text-[10px]">JD</div>
                </div>
                <div className="text-white/50 text-[10px] uppercase tracking-widest mb-1 font-sans">Horas validadas</div>
                <div className="text-4xl font-sans font-bold">124<span className="text-sm text-white/40 ml-1">h</span></div>
              </div>
              
              <div className="p-5 flex-1 bg-gray-50">
                <div className="text-[#0a0a09] font-sans font-bold text-xs uppercase tracking-wider mb-4">Actividad Reciente</div>
                
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-[#0a0a09] text-sm font-sans">Reforestación</div>
                    <span className="text-[8px] text-[--tribu-green] font-bold bg-[--tribu-green]/10 px-2 py-1 rounded tracking-wider">COMPLETA</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mb-3 font-sans">Parque Nacional • Hoy</div>
                  <div className="flex gap-2">
                    <span className="text-[10px] text-[--tribu-green] bg-[--tribu-green]/10 px-2 py-1 rounded font-bold font-sans">+4 Horas</span>
                    <span className="text-[10px] text-gray-600 bg-gray-100 px-2 py-1 rounded font-medium font-sans">Ecología</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

export default Hero;
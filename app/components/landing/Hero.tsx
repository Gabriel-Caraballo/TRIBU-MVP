"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export const Hero = () => {
  const [phase, setPhase] = useState<'scanning' | 'success' | 'app'>('scanning');

  useEffect(() => {
    const sequence = [
      { state: 'scanning', delay: 0 },
      { state: 'success', delay: 3000 },
      { state: 'app', delay: 4500 },
    ] as const;

    let current = 0;
    const interval = setInterval(() => {
      current = (current + 1) % sequence.length;
      setPhase(sequence[current].state);
    }, 3000); // Ajustado para un flujo más natural

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a09] text-[#e8e8e2] border-b border-white/5">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.08),transparent_50%)] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 pt-32 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl">

        {/* Columna Izquierda: Mensaje Estratégico */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30 bg-green-500/5 text-[10px] uppercase tracking-[0.2em] font-bold mb-6 text-green-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Infraestructura de Impacto
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-sans font-black tracking-tighter leading-[1.1] mb-8 uppercase">
            Menos <span className="text-[#8a8a82]">administración</span>,<br />
            más <span className="text-green-500 italic">impacto</span>.
          </h1>

          <p className="text-base md:text-lg text-[#8a8a82] leading-relaxed max-w-xl mb-10 font-medium">
            Conectamos talento que actúa con proyectos que trascienden.
            Eliminamos el <span className="text-white border-b border-white/20">Excel del sector social</span> para transformar la voluntad en
            <strong className="text-white"> capital de carrera </strong> y reportes
            <strong className="text-white"> ESG auditables</strong>.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href="/organizations" className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-3 text-[11px] font-bold tracking-[0.15em] uppercase bg-white text-black px-8 py-5 hover:bg-green-500 hover:text-white transition-all duration-300 shadow-xl shadow-white/5">
              Potenciar mi ONG
            </Link>
            <Link href="/volunteers" className="w-full sm:w-auto inline-flex items-center justify-center gap-3 text-[11px] font-bold tracking-[0.15em] uppercase border border-white/20 text-white px-8 py-5 hover:border-green-500 hover:bg-green-500/5 transition-all duration-300">
              Empezar a Impactar
            </Link>
          </div>

          {/* Social Proof Placeholder */}
          <div className="mt-12 flex items-center gap-8 opacity-30 grayscale hover:opacity-60 transition-opacity">
            <span className="text-[10px] font-mono tracking-widest uppercase">Trusted by:</span>
            <div className="flex gap-6 items-center">
              <div className="h-4 w-20 bg-white/40 rounded-sm"></div>
              <div className="h-4 w-24 bg-white/40 rounded-sm"></div>
              <div className="h-4 w-16 bg-white/40 rounded-sm"></div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Phone Mockup */}
        <div className="flex justify-center order-1 lg:order-2 w-full perspective-1000">
          <div className="relative w-[280px] h-[580px] border-[12px] border-[#1a1a18] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col bg-[#0a0a09] ring-1 ring-white/10 lg:rotate-3 hover:rotate-0 transition-transform duration-700 ease-out group">

            {/* Camera Notch */}
            <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-50">
              <div className="w-24 h-5 bg-[#1a1a18] rounded-b-2xl"></div>
            </div>

            {/* Content: Phase Scanning */}
            <div className={`absolute inset-0 transition-all duration-500 flex flex-col items-center justify-center bg-[#0a0a09] ${phase === 'scanning' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div className="text-green-500 font-mono text-[9px] mb-8 uppercase tracking-[0.3em] animate-pulse">Escaneando Punto de Impacto</div>
              <div className="relative w-48 h-48 border border-white/5 rounded-2xl flex items-center justify-center bg-white/[0.02]">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-green-500"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-green-500"></div>
                <div className="w-24 h-24 opacity-20 bg-green-500 blur-3xl absolute animate-pulse"></div>

                {/* QR Simulation Grid */}
                <div className="grid grid-cols-3 gap-1.5 w-12 opacity-30">
                  {[...Array(9)].map((_, i) => <div key={i} className="w-full h-3 bg-white"></div>)}
                </div>

                {/* Scan Line Animation */}
                <div className="absolute top-0 inset-x-0 h-[2px] bg-green-500 shadow-[0_0_15px_#22c55e] animate-[scanLine_2s_infinite]"></div>
              </div>
            </div>

            {/* Content: Phase Success */}
            <div className={`absolute inset-0 transition-all duration-500 flex flex-col items-center justify-center bg-green-500 ${phase === 'success' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mb-6 shadow-2xl animate-bounce">
                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-black font-sans font-black text-xs uppercase tracking-tighter text-center">
                HORA VALIDADA <br /> <span className="text-[10px] opacity-70">REPORTABLE EN ESG</span>
              </p>
            </div>

            {/* Content: Phase App */}
            <div className={`absolute inset-0 transition-all duration-700 flex flex-col bg-[#f4f4f2] ${phase === 'app' ? 'opacity-100 transform-none' : 'opacity-0 translate-y-4'}`}>
              <div className="pt-12 pb-8 px-6 bg-black text-white rounded-b-[2.5rem] shadow-lg">
                <div className="flex justify-between items-center mb-8">
                  <span className="font-sans font-black text-sm tracking-tighter uppercase text-green-500 italic">Tribu.Data</span>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">JD</div>
                </div>
                <div className="space-y-1">
                  <div className="text-white/40 text-[8px] uppercase tracking-[0.2em] font-bold">Career Capital Acumulado</div>
                  <div className="text-5xl font-sans font-black tracking-tighter">124.5<span className="text-lg text-green-500">h</span></div>
                </div>
              </div>

              <div className="p-6 flex-1">
                <div className="flex justify-between items-center mb-6">
                  <div className="text-black font-black text-[10px] uppercase tracking-wider">Métricas de Impacto</div>
                  <div className="h-px flex-1 bg-black/10 ml-4"></div>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Reforestación', val: '85%', status: 'VERIFIED' },
                    { label: 'Mentoría STEM', val: '40%', status: 'PENDING' }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-black/5">
                      <div className="flex justify-between items-start mb-3">
                        <div className="font-bold text-black text-[10px] uppercase">{item.label}</div>
                        <span className={`text-[7px] font-black px-2 py-0.5 rounded tracking-widest ${item.status === 'VERIFIED' ? 'text-green-600 border border-green-200' : 'text-gray-400'}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="w-full bg-black/5 h-1 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: item.val }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ESG Badge */}
          <div className="absolute -bottom-4 -right-4 lg:-right-8 bg-white text-black p-4 shadow-2xl rounded-2xl hidden md:block max-w-[150px] border border-black/5 animate-pulse">
            <p className="text-[9px] font-bold uppercase tracking-tight leading-tight">
              Cumplimiento bajo estándar <span className="text-green-600 italic">GRI & SASB</span>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scanLine {
          0%, 100% { transform: translateY(0); opacity: 0; }
          10%, 90% { opacity: 1; }
          50% { transform: translateY(190px); }
        }
      `}</style>
    </section>
  );
};

export default Hero;

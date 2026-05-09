// components/landing/ProblemSection.tsx
// Sección que muestra el problema que TRIBU resuelve

"use client";

export const ProblemSection = () => {
  // Datos de las pain cards
  const painCards = [
    {
      number: '01',
      title: 'Hojas de Excel interminables',
      description: 'Control de asistencia en papel, WhatsApp para coordinar, sin historial real de quién hizo qué ni cuándo.',
    },
    {
      number: '02',
      title: 'Voluntarios que no regresan',
      description: 'Rotación constante. Cada actividad es casi de cero. Sin incentivos reales, la buena voluntad se agota.',
    },
    {
      number: '03',
      title: 'Impacto invisible',
      description: 'Donantes y patrocinadores piden evidencia. Tú tienes historias hermosas, pero no tienes datos auditables.',
    },
  ];
  
  return (
    <section id="problem" className="py-24 md:py-32 bg-[#111110] text-[#e8e8e2] font-mono border-b border-white/10 relative overflow-hidden">
      {/* Acentos de color */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-[--tribu-green] opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
      <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-[--tribu-blue] opacity-[0.03] rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-[#8a8a82] uppercase mb-16">
          <span className="text-[--tribu-green]">#</span> EL_PROBLEMA
        </div>

        <div className="mb-20 md:w-2/3">
          <h2 className="text-4xl md:text-5xl font-sans uppercase tracking-wide leading-[1.1] font-bold mb-6 text-[#e8e8e2]">
            El estado actual de la <em className="bg-[--tribu-green] text-[#0a0a09] px-2 not-italic inline-block">gestión social</em>.
          </h2>
          <p className="text-sm md:text-base text-[#8a8a82] leading-relaxed max-w-2xl font-mono">
            A pesar de las buenas intenciones, la gestión de voluntarios en el sector social está estancada en procesos administrativos arcaicos que limitan el impacto.
          </p>
        </div>
        
        {/* Pain Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {painCards.map((card, index) => (
            <div key={index} className="bg-[#0a0a09] border border-white/10 p-8 hover:border-[--tribu-green]/30 transition-colors duration-500">
              <span className="block font-sans font-bold text-4xl text-[--tribu-green] opacity-50 mb-6 tracking-tighter">_{card.number}</span>
              <h3 className="text-xl font-sans uppercase tracking-wide font-bold mb-4 text-[#e8e8e2]">{card.title}</h3>
              <p className="text-xs text-[#8a8a82] leading-relaxed">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;

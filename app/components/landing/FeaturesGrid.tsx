// components/landing/FeaturesGrid.tsx
// Grid de características principales organizadas por los 3 pilares del producto

"use client";

import { useRef, useEffect } from 'react';

interface FeatureCard {
  title: string;
  icon: React.ReactNode;
  features: string[];
  accentColor: string;
  isPopular?: boolean;
}

interface FeaturesGridProps {}

export const FeaturesGrid: React.FC<FeaturesGridProps> = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  // Efecto de fade-in al hacer scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );
    
    // Observar la sección
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    // Observar cada card con un delay staggered
    cardsRef.current.forEach((card, index) => {
      if (card) {
        // Agregar transparencia inicial
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        // Configurar animación con delay staggered
        setTimeout(() => {
          observer.observe(card);
        }, 150 * index);
      }
    });
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
      cardsRef.current.forEach((card) => {
        if (card) {
          observer.unobserve(card);
        }
      });
    };
  }, []);
  
  // Datos de las feature cards
  const featureCards: FeatureCard[] = [
    {
      title: 'Gestión de Talento Real',
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      features: [
        'Dashboard centralizado para toda tu ONG',
        'Perfiles de voluntarios con habilidades verificadas',
        'Matchmaking inteligente por skill',
        'Validación de asistencia por QR dinámico',
        'Historial inmutable de cada hora trabajada'
      ],
      accentColor: 'var(--tribu-green)'
    },
    {
      title: 'Retención Basada en Valor',
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      features: [
        'Certificados de competencias validados por IA',
        'El voluntario construye su CV mientras ayuda',
        'Sistema de niveles y reconocimiento',
        'Recordatorios automáticos de actividades',
        'Historial exportable para hojas de vida'
      ],
      accentColor: 'var(--tribu-blue)',
      isPopular: true
    },
    {
      title: 'Impacto Medible y Auditable',
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      features: [
        'Reportes automáticos bajo estándares ESG',
        'Datos listos para donantes corporativos',
        'Retorno social calculado por actividad',
        'Exportación a PDF certificado',
        'Integración con programas de RSC'
      ],
      accentColor: 'var(--tribu-yellow)'
    }
  ];
  
  return (
    <section 
      ref={sectionRef} 
      id="features" 
      className="py-24 md:py-32 bg-[#0a0a09] text-[#e8e8e2] font-mono border-b border-white/10"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-[#8a8a82] uppercase mb-16">
          <span className="text-[--tribu-green]">#</span> CARACTERÍSTICAS
        </div>
        
        <h2 className="text-4xl md:text-5xl font-sans uppercase tracking-wide leading-[1.1] font-bold mb-16">
          Lo que necesitas para profesionalizar tu <em className="bg-[#e8e8e2] text-[#0a0a09] px-2 not-italic inline-block">voluntariado</em>.
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {featureCards.map((card, index) => (
            <div
              key={index}
              ref={(el: HTMLDivElement | null) => { cardsRef.current[index] = el; }}
              className={`bg-[#111110] border border-white/10 p-8 transition-all duration-500 hover:-translate-y-2 ${
                card.isPopular 
                  ? 'relative ring-1 ring-[--tribu-blue]' 
                  : ''
              }`}
              style={{
                opacity: 0,
                transform: 'translateY(20px)',
                transitionDelay: `${index * 150}ms`,
              }}
            >
              {/* Badge "Más popular" si aplica */}
              {card.isPopular && (
                <div className="absolute -top-4 right-6 scale-95">
                  <span className="bg-[--tribu-blue] text-[#0a0a09] text-[10px] font-bold tracking-widest uppercase px-3 py-1 shadow-lg">
                    Más popular
                  </span>
                </div>
              )}
              
              <div className="h-full flex flex-col">
                {/* Icono con gradiente */}
                <div className="mb-6 flex items-center justify-center" style={{ color: card.accentColor }}>
                  {card.icon}
                </div>
                
                {/* Título serif */}
                <h3 className="text-2xl font-sans uppercase tracking-wide font-bold mb-6 text-[#e8e8e2]">
                  {card.title}
                </h3>
                
                {/* Lista de características con checkmark colorido */}
                <ul className="space-y-4 flex-grow">
                  {card.features.map((feature, i) => (
                    <li key={i} className="flex items-start group">
                      <span className="mr-3 flex-shrink-0 mt-0.5 font-bold" style={{ color: card.accentColor }}>✓</span>
                      <span className="text-xs text-[#8a8a82] group-hover:text-[#e8e8e2] transition-colors leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
// components/landing/ProblemSection.tsx
// Sección que muestra el problema que TRIBU resuelve

"use client";

import { useRef, useEffect } from 'react';

interface ProblemSectionProps {}

export const ProblemSection: React.FC<ProblemSectionProps> = () => {
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
        }, 150 * index); // 150ms de delay entre cada card
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
  
  // Datos de las pain cards
  const painCards = [
    {
      icon: '📋',
      title: 'Hojas de Excel interminables',
      description: 'Control de asistencia en papel, WhatsApp para coordinar, sin historial real de quién hizo qué ni cuándo.',
    },
    {
      icon: '📱',
      title: 'Voluntarios que no regresan',
      description: 'Rotación constante. Cada actividad es casi de cero. Sin incentivos reales, la buena voluntad se agota.',
    },
    {
      icon: '📉',
      title: 'Impacto invisible',
      description: 'Donantes y patrocinadores piden evidencia. Tú tienes historias hermosas, pero no tienes datos auditables.',
    },
  ];
  
  return (
    <section 
      ref={sectionRef} 
      id="problem" 
      className="py-20 bg-[--tribu-light]"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="h2-section text-[--tribu-navy] mb-3">¿Reconoces este escenario?</h2>
          <p className="h3-subsection text-[--tribu-gray] max-w-2xl mx-auto">
            La mayoría de las ONGs gestionan su voluntariado así:
          </p>
        </div>
        
        {/* Pain Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto mb-16">
          {painCards.map((card, index) => (
            <div
              key={index}
              ref={(el: HTMLDivElement | null) => { cardsRef.current[index] = el; }}
              className="bg-white border-l-4 border-[--tribu-peach] rounded-lg shadow-md p-6 transition-all duration-500"
              style={{
                opacity: 0,
                transform: 'translateY(20px)',
                transitionDelay: `${index * 150}ms`,
              }}
            >
              <div className="text-4xl mb-4">{card.icon}</div>
              <h3 className="text-xl font-bold text-[--tribu-dark] mb-3">{card.title}</h3>
              <p className="text-[--tribu-gray]">{card.description}</p>
            </div>
          ))}
        </div>
        
        {/* Transición */}
        <div className="text-center">
          <svg 
            className="w-12 h-12 mx-auto mb-4 text-[--tribu-navy]" 
            fill="currentColor" 
            viewBox="0 0 20 20" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              fillRule="evenodd" 
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
              clipRule="evenodd"
            />
          </svg>
          <p className="text-2xl font-bold text-[--tribu-navy]">Hay una forma mejor.</p>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
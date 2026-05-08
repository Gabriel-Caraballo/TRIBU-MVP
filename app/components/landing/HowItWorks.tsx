// components/landing/HowItWorks.tsx
// Sección de cómo funciona TRIBU, con tabs para ONGs y Voluntarios

"use client";

import { useState, useRef, useEffect } from 'react';

interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface HowItWorksProps {}

export const HowItWorks: React.FC<HowItWorksProps> = () => {
  const [activeTab, setActiveTab] = useState<'ongs' | 'volunteers'>('ongs');
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  // Pasos para ONGs
  const ongsSteps: Step[] = [
    {
      number: 1,
      title: 'Crea tu organización',
      description: 'Registra tu ONG en minutos. Sube tu logo, describe tu misión y comienza a publicar actividades.',
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      number: 2,
      title: 'Publica actividades con habilidades',
      description: 'Especifica qué tipo de voluntario necesitas: diseñador, comunicador, contador. TRIBU hace el matchmaking.',
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      number: 3,
      title: 'Mide el impacto en tiempo real',
      description: 'Validación de asistencia por QR dinámico. Dashboard con métricas reales. Reportes listos para tus donantes.',
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"> 
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];
  
  // Pasos para Voluntarios
  const volunteersSteps: Step[] = [
    {
      number: 1,
      title: 'Crea tu perfil de habilidades',
      description: 'Declara lo que sabes hacer. Diseño, comunicación, programación, idiomas. Tu perfil es tu carta de presentación.',
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      number: 2,
      title: 'Encuentra causas que importan',
      description: 'Explora actividades filtradas por tus habilidades. Regístrate con un clic.',
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      number: 3,
      title: 'Construye tu historial verificado',
      description: 'Cada hora que das queda registrada. Acumula certificados de habilidades validados por IA que suman a tu CV.',
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    }
  ];
  
  // Obtener los pasos basados en la tab activa
  const activeSteps = activeTab === 'ongs' ? ongsSteps : volunteersSteps;
  
  // Efecto de fade-in al hacer scroll y al cambiar de tab
  useEffect(() => {
    // Resetear animaciones al cambiar de tab
    stepsRef.current.forEach((step, index) => {
      if (step) {
        step.style.opacity = '0';
        step.style.transform = 'translateY(20px)';
        
        // Agregar animación con delay staggered
        setTimeout(() => {
          step.style.opacity = '1';
          step.style.transform = 'translateY(0)';
        }, 100 * index);
      }
    });
  }, [activeTab]);
  
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="h2-section text-[--tribu-navy] mb-12">Cómo funciona</h2>
          
          {/* Tabs */}
          <div className="inline-flex border-b border-gray-200 mb-12">
            <button
              className={`px-6 py-3 text-lg font-medium transition-colors relative ${
                activeTab === 'ongs' 
                  ? 'text-[--tribu-navy] font-bold' 
                  : 'text-[--tribu-gray]'
              }`}
              onClick={() => setActiveTab('ongs')}
            >
              Para ONGs
              {activeTab === 'ongs' && (
                <span className="absolute bottom-0 left-0 w-full h-1 bg-[--tribu-blue]"></span>
              )}
            </button>
            <button
              className={`px-6 py-3 text-lg font-medium transition-colors relative ${
                activeTab === 'volunteers' 
                  ? 'text-[--tribu-navy] font-bold' 
                  : 'text-[--tribu-gray]'
              }`}
              onClick={() => setActiveTab('volunteers')}
            >
              Para Voluntarios
              {activeTab === 'volunteers' && (
                <span className="absolute bottom-0 left-0 w-full h-1 bg-[--tribu-blue]"></span>
              )}
            </button>
          </div>
        </div>
        
        {/* Pasos */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {activeSteps.map((step, index) => (
              <div
                key={`${activeTab}-step-${index}`}
                ref={(el: HTMLDivElement | null) => { stepsRef.current[index] = el; }}
                className="transition-all duration-500"
                style={{
                  opacity: 0,
                  transform: 'translateY(20px)',
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                {/* Número del paso */}
                <div className="w-14 h-14 rounded-full bg-[--tribu-blue] text-white flex items-center justify-center font-bold text-xl mb-4">
                  {step.number}
                </div>
                
                {/* Iconos */}
                <div className="text-[--tribu-blue] mb-4">
                  {step.icon}
                </div>
                
                {/* Contenido del paso */}
                <h3 className="text-xl font-bold text-[--tribu-navy] mb-3">{step.title}</h3>
                <p className="text-[--tribu-gray]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
// components/landing/ForWhom.tsx
// Sección que muestra para quién está diseñado TRIBU: ONGs y Voluntarios

"use client";

import Link from 'next/link';
import { useRef, useEffect } from 'react';

interface ForWhomProps {}

export const ForWhom: React.FC<ForWhomProps> = () => {
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
        }, 200 * index);
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
    <section 
      ref={sectionRef} 
      id="for-whom" 
      className="py-20 bg-white"
    >
      <div className="container mx-auto px-4">
        <h2 className="h2-section text-[--tribu-navy] text-center mb-12">
          Diseñado para dos mundos que deben conectarse
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Card para ONGs */}
          <div
            ref={(el: HTMLDivElement | null) => { cardsRef.current[0] = el; }}
            id="for-ngos"
            className="rounded-xl border border-[--tribu-blue] overflow-hidden transition-all duration-500"
            style={{
              opacity: 0,
              transform: 'translateY(20px)',
              background: 'linear-gradient(135deg, var(--tribu-blue-light) 0%, #ffffff 100%)',
            }}
          >
            <div className="p-8">
              <h3 className="text-2xl font-bold text-[--tribu-navy] mb-2">
                Para ONGs y ASFLs
              </h3>
              <p className="text-[--tribu-gray] text-lg font-medium mb-6">
                Deja de administrar, empieza a ejecutar
              </p>
              
              <ul className="space-y-4 mb-8">
                {forOngsBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-[--tribu-blue] mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0  20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[--tribu-gray]">{benefit}</span>
                  </li>
                ))}
              </ul>
              
<Link 
                href="/auth/register" 
                className="btn btn-primary inline-block"
              >
                Registra tu ONG gratis →
              </Link>
            </div>
          </div>
          
          {/* Card para Voluntarios */}
          <div
            ref={(el: HTMLDivElement | null) => { cardsRef.current[1] = el; }}
            id="for-volunteers"
            className="rounded-xl border border-[--tribu-green] overflow-hidden transition-all duration-500"
            style={{
              opacity: 0,
              transform: 'translateY(20px)',
              background: 'linear-gradient(135deg, var(--tribu-green-light) 0%, #ffffff 100%)',
            }}
          >
            <div className="p-8">
              <h3 className="text-2xl font-bold text-[--tribu-navy] mb-2">
                Para Voluntarios
              </h3>
              <p className="text-[--tribu-gray] text-lg font-medium mb-6">
                Tu tiempo vale. Hazlo contar.
              </p>
              
              <ul className="space-y-4 mb-8">
                {forVolunteersBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-[--tribu-green] mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[--tribu-gray]">{benefit}</span>
                  </li>
                ))}
              </ul>
              
<Link 
                href="/auth/register" 
                className="btn bg-[--tribu-green] text-white hover:bg-[--tribu-green]/90 inline-block"
              >
                Únete como voluntario →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForWhom;
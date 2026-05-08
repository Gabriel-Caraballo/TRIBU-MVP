// components/landing/FinalCTA.tsx
// Sección final de llamado a la acción con alto impacto visual

"use client";

import Link from 'next/link';
import { useRef, useEffect } from 'react';

interface FinalCTAProps {}

export const FinalCTA: React.FC<FinalCTAProps> = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
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
    
    // Observar el contenido
    if (contentRef.current) {
      // Agregar transparencia inicial
      contentRef.current.style.opacity = '0';
      contentRef.current.style.transform = 'translateY(20px)';
      
      observer.observe(contentRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
      if (contentRef.current) {
        observer.unobserve(contentRef.current);
      }
    };
  }, []);
  
  const trustBadges = [
    { icon: '🔒', text: 'Datos seguros con Supabase' },
    { icon: '📱', text: 'Funciona en cualquier celular' },
    { icon: '🇩🇴', text: 'Hecho en República Dominicana' }
  ];
  
  return (
    <section 
      ref={sectionRef} 
      className="py-20 bg-gradient-to-br from-[--tribu-navy] via-[#2A4F8A] to-[--tribu-blue] relative overflow-hidden"
    >
      {/* Formas abstractas de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-64 h-64 rounded-full bg-[--tribu-peach] opacity-[0.07]"></div>
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 rounded-full bg-white opacity-[0.07]"></div>
        <div className="absolute bottom-[10%] left-[20%] w-40 h-40 hexagon bg-[--tribu-peach] opacity-[0.08]"></div>
      </div>
      
      <div 
        ref={contentRef}
        className="container mx-auto px-4 relative z-10 text-center max-w-4xl transition-all duration-500"
        style={{ opacity: 0, transform: 'translateY(20px)' }}
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
          Tu causa merece más que una hoja de Excel
        </h2>
        
        <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">
          Únete a las organizaciones que ya están profesionalizando su impacto. Configura TRIBU en menos de 5 minutos.
        </p>
        
<div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <Link 
            href="/auth/register" 
            className="btn btn-white text-[--tribu-navy] font-medium"
          >
            Registra tu NGO gratis
          </Link>
          
          <Link 
            href="/auth/register" 
            className="btn btn-outline-white font-medium"
          >
            Soy voluntario
          </Link>
        </div>
        
        {/* Badges de confianza */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
          {trustBadges.map((badge, index) => (
            <div 
              key={index} 
              className="text-white/80 flex items-center text-sm sm:text-base"
            >
              <span className="mr-2 text-lg">{badge.icon}</span>
              <span>{badge.text}</span>
              
              {/* Separador, excepto para el último */}
              {index < trustBadges.length - 1 && (
                <span className="hidden sm:block ml-8">·</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
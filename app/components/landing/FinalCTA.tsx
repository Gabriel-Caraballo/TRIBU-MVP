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
    { icon: '[SEC]', text: 'Datos seguros con Supabase' },
    { icon: '[MOB]', text: 'Funciona en cualquier celular' },
    { icon: '[RD]', text: 'Hecho en República Dominicana' }
  ];
  
  return (
    <section 
      ref={sectionRef} 
      className="py-24 md:py-32 bg-[#0a0a09] font-mono relative overflow-hidden border-b border-white/10"
    >
      
      <div 
        ref={contentRef}
        className="container mx-auto px-4 relative z-10 text-center max-w-4xl transition-all duration-500 bg-[#111110] border border-[--tribu-green]/30 p-12 md:p-20 shadow-[0_0_50px_-15px_var(--tribu-green)]"
        style={{ opacity: 0, transform: 'translateY(20px)' }}
      >
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-sans uppercase tracking-wide font-bold text-[#e8e8e2] mb-6 leading-[1.1]">
          Inicia tu nueva <em className="bg-[--tribu-green] text-[#0a0a09] px-2 not-italic inline-block">era</em>.
        </h2>
        
        <p className="text-sm text-[#8a8a82] mb-12 max-w-2xl mx-auto leading-relaxed">
          Únete a las organizaciones que ya están profesionalizando su impacto. Despliegue inmediato, sin costos ocultos.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <Link 
            href="/auth/register" 
            className="inline-flex items-center justify-center gap-3 text-xs font-bold tracking-widest uppercase bg-[--tribu-green] text-white px-10 py-5 hover:bg-[#e8e8e2] hover:text-[#0a0a09] transition-colors duration-300"
          >
            Registra tu ONG gratis
          </Link>
          
          <Link 
            href="/auth/register" 
            className="inline-flex items-center justify-center gap-3 text-xs font-bold tracking-widest uppercase bg-[#111110] text-[#e8e8e2] border border-white/10 px-10 py-5 hover:text-white hover:border-white/30 transition-colors duration-300"
          >
            Soy voluntario
          </Link>
        </div>
        
        {/* Badges de confianza */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
          {trustBadges.map((badge, index) => (
            <div 
              key={index} 
              className="text-[#8a8a82] flex items-center text-[10px] tracking-widest uppercase"
            >
              <span className="mr-2 opacity-50">{badge.icon}</span>
              <span>{badge.text}</span>
              
              {/* Separador, excepto para el último */}
              {index < trustBadges.length - 1 && (
                <span className="hidden sm:block ml-8 text-white/10">|</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
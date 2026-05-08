// components/landing/Hero.tsx
// Sección principal hero con gradiente, copy principal y mockup del dashboard

"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useRef, useEffect } from 'react';

interface HeroProps {}

export const Hero: React.FC<HeroProps> = () => {
  // Ref para las formas geométricas del fondo
  const shapesRef = useRef<HTMLDivElement>(null);
  
  // Efecto parallax sutil en las formas del fondo
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!shapesRef.current) return;
      
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      const shapes = shapesRef.current.querySelectorAll('.bg-shape');
      shapes.forEach((shape, i) => {
        const speed = 1 + i * 0.5;
        const htmlShape = shape as HTMLElement;
        htmlShape.style.transform = `translate(${x * speed * 10}px, ${y * speed * 10}px)`;
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return (
    <section className="min-h-screen bg-gradient-to-br from-[--tribu-navy] via-[#2A4F8A] to-[--tribu-blue] relative overflow-hidden">
      {/* Formas geométricas de fondo */}
      <div ref={shapesRef} className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="bg-shape absolute top-[10%] left-[5%] w-48 sm:w-64 h-48 sm:h-64 rounded-full bg-[--tribu-peach] opacity-[0.07]"></div>
        <div className="bg-shape absolute top-[60%] left-[15%] w-32 sm:w-40 h-32 sm:h-40 rounded-full bg-white opacity-[0.05]"></div>
        <div className="bg-shape absolute top-[30%] right-[10%] w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-white opacity-[0.04]"></div>
        <div className="bg-shape absolute bottom-[15%] right-[25%] w-32 sm:w-48 h-32 sm:h-48 rounded-full bg-[--tribu-peach] opacity-[0.08]"></div>
      </div>
      
      {/* Contenido principal */}
      <div className="container mx-auto px-4 pt-28 pb-12 sm:pt-32 sm:pb-16 md:pt-40 md:pb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Columna izquierda: Copy + CTAs */}
          <div className="text-white max-w-xl order-2 lg:order-1">
            {/* Tag line */}
            <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1.5 mb-5 text-xs sm:text-sm">
              <span className="mr-1.5">✦</span>
              <span className="font-medium">Plataforma de gestión de voluntariado</span>
            </div>
            
            {/* Título principal */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Convierte buena voluntad en impacto medible
            </h1>
            
            {/* Subtítulo */}
            <p className="text-base sm:text-lg mb-6 text-white/90 max-w-lg">
              TRIBU es la plataforma que las ONGs necesitaban: gestiona tu talento voluntario con herramientas de nivel corporativo.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
              <Link
                href="/auth/register"
                className="px-5 py-3 bg-white text-[--tribu-navy] rounded-lg font-medium text-center hover:bg-gray-100 transition-colors text-sm sm:text-base"
              >
                Registra tu ONG — es gratis
              </Link>
              <Link
                href="/auth/register"
                className="px-5 py-3 border border-white text-white rounded-lg font-medium text-center hover:bg-white/10 transition-colors text-sm sm:text-base"
              >
                Soy voluntario, únete
              </Link>
            </div>
            
            {/* Texto bajo CTAs */}
            <p className="text-xs sm:text-sm text-white/80 flex flex-wrap gap-x-3 gap-y-1">
              <span>Sin tarjeta de crédito</span>
              <span>·</span>
              <span>Configuración en 5 minutos</span>
              <span>·</span>
              <span>Cancela cuando quieras</span>
            </p>
          </div>
        
          {/* Columna derecha: Mockup del dashboard */}
          <div className="floating order-1 lg:order-2 mb-8 lg:mb-0">
            {/* Dashboard mockup */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-lg mx-auto">
              {/* Header del mockup */}
              <div className="px-4 sm:px-6 py-3 bg-[--tribu-navy] text-white flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-md flex items-center justify-center text-white text-xs sm:text-sm">
                    T
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base">Dashboard TRIBU</h3>
                </div>
                <div className="flex space-x-1.5 sm:space-x-2">
                  <div className="w-2 h-2 rounded-full bg-white/50"></div>
                  <div className="w-2 h-2 rounded-full bg-white/50"></div>
                  <div className="w-2 h-2 rounded-full bg-white/50"></div>
                </div>
              </div>
              
              {/* Contenido del mockup */}
              <div className="p-4 sm:p-6">
                {/* Card de actividad */}
                <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-sm mb-4 sm:mb-6">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-[--tribu-navy] text-sm sm:text-base">Reforestación Parque Nacional</h4>
                    <span className="text-xs bg-[--tribu-green-light] text-[--tribu-green] py-1 px-2 rounded-full">En progreso</span>
                  </div>
                  <p className="text-[--tribu-gray] text-xs sm:text-sm mb-3">Sábado, 22 Mayo • 09:00 - 14:00</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <span className="text-xs bg-[--tribu-blue-light] text-[--tribu-blue] py-1 px-2 rounded-full">Ecología</span>
                    <span className="text-xs bg-[--tribu-green-light] text-[--tribu-green] py-1 px-2 rounded-full">Trabajo manual</span>
                  </div>
                </div>
                
                {/* Mini lista de voluntarios */}
                <div className="mb-4 sm:mb-6">
                  <h4 className="font-medium text-[--tribu-navy] mb-2 sm:mb-3 text-sm">Voluntarios (8/10)</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[--tribu-blue-light] text-[--tribu-blue] flex items-center justify-center font-medium text-xs sm:text-sm mr-2">JD</div>
                        <span className="text-xs sm:text-sm">Juan Díaz</span>
                      </div>
                      <span className="text-[--tribu-green] text-xs sm:text-sm">✓ Presente</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[--tribu-green-light] text-[--tribu-green] flex items-center justify-center font-medium text-xs sm:text-sm mr-2">MP</div>
                        <span className="text-xs sm:text-sm">María Pérez</span>
                      </div>
                      <span className="text-[--tribu-green] text-xs sm:text-sm">✓ Presente</span>
                    </div>
                  </div>
                </div>
                
                {/* Contador de horas */}
                <div className="bg-[--tribu-blue-light]/50 rounded-xl p-3 sm:p-4 text-center">
                  <h4 className="text-[--tribu-navy] font-medium mb-1 text-xs sm:text-sm">Horas de impacto generadas</h4>
                  <div className="text-[--tribu-blue] text-3xl sm:text-4xl font-bold">127</div>
                  <p className="text-xs text-[--tribu-gray] mt-1">Este mes: +42 horas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
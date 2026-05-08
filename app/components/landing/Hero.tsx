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
        <div className="bg-shape absolute top-[10%] left-[5%] w-64 h-64 rounded-full bg-[--tribu-peach] opacity-[0.07]"></div>
        <div className="bg-shape absolute top-[60%] left-[15%] w-40 h-40 rounded-full bg-white opacity-[0.05]"></div>
        <div className="bg-shape absolute top-[30%] right-[10%] w-96 h-96 rounded-full bg-white opacity-[0.04]"></div>
        <div className="bg-shape absolute bottom-[15%] right-[25%] w-48 h-48 hexagon bg-[--tribu-peach] opacity-[0.08]"></div>
      </div>
      
      {/* Contenido principal */}
      <div className="container mx-auto px-4 pt-32 pb-16 md:pt-40 md:pb-20 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Columna izquierda: Copy + CTAs */}
        <div className="text-white max-w-xl">
          {/* Tag line */}
          <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 mb-6">
            <span className="mr-1.5">✦</span>
            <span className="text-sm font-medium">Plataforma de gestión de voluntariado</span>
          </div>
          
          {/* Título principal */}
          <h1 className="h1-hero mb-6">
            Convierte buena voluntad en impacto medible
          </h1>
          
          {/* Subtítulo */}
          <p className="body-large mb-8 text-white/90 max-w-lg">
            TRIBU es la plataforma que las ONGs necesitaban: gestiona tu talento voluntario con herramientas de nivel corporativo. Los voluntarios crecen. El impacto se mide. La causa avanza.
          </p>
          
{/* CTAs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <Link
              href="/auth/register"
              className="btn btn-white text-[--tribu-navy] font-medium"
            >
              Registra tu ONG — es gratis
            </Link>
            <Link
              href="/auth/register"
              className="btn btn-outline-white font-medium"
            >
              Soy voluntario, únete
            </Link>
          </div>
          
          {/* Texto bajo CTAs */}
          <p className="text-sm text-white/80 flex flex-wrap items-center gap-x-4">
            <span>Sin tarjeta de crédito</span>
            <span className="hidden sm:inline">·</span>
            <span>Configuración en 5 minutos</span>
            <span className="hidden sm:inline">·</span>
            <span>Cancela cuando quieras</span>
          </p>
        </div>
        
        {/* Columna derecha: Mockup del dashboard */}
        <div className="floating">
          {/* Dashboard mockup con HTML/CSS puro */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-lg mx-auto">
            {/* Header del mockup */}
            <div className="px-6 py-4 bg-[--tribu-navy] text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-md flex items-center justify-center text-white">
                  T
                </div>
                <h3 className="font-semibold">Dashboard TRIBU</h3>
              </div>
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-white/50"></div>
                <div className="w-2 h-2 rounded-full bg-white/50"></div>
                <div className="w-2 h-2 rounded-full bg-white/50"></div>
              </div>
            </div>
            
            {/* Contenido del mockup */}
            <div className="p-6">
              {/* Card de actividad */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-[--tribu-navy]">Reforestación Parque Nacional</h4>
                  <span className="text-xs bg-[--tribu-green-light] text-[--tribu-green] py-1 px-2 rounded-full">En progreso</span>
                </div>
                <p className="text-[--tribu-gray] text-sm mb-3">Sábado, 22 Mayo • 09:00 - 14:00 • Santo Domingo Este</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs bg-[--tribu-blue-light] text-[--tribu-blue] py-1 px-2 rounded-full">Ecología</span>
                  <span className="text-xs bg-[--tribu-green-light] text-[--tribu-green] py-1 px-2 rounded-full">Trabajo manual</span>
                  <span className="text-xs bg-[--tribu-orange-light] text-[--tribu-orange] py-1 px-2 rounded-full">Comunicación</span>
                </div>
              </div>
              
              {/* Mini lista de voluntarios */}
              <div className="mb-6">
                <h4 className="font-medium text-[--tribu-navy] mb-3">Voluntarios (8/10)</h4>
                <div className="space-y-2">
                  {/* Voluntario 1 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-[--tribu-blue-light] text-[--tribu-blue] flex items-center justify-center font-medium text-sm mr-2">JD</div>
                      <span className="text-sm">Juan Díaz</span>
                    </div>
                    <span className="text-[--tribu-green] text-sm">✓ Presente</span>
                  </div>
                  
                  {/* Voluntario 2 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-[--tribu-green-light] text-[--tribu-green] flex items-center justify-center font-medium text-sm mr-2">MP</div>
                      <span className="text-sm">María Pérez</span>
                    </div>
                    <span className="text-[--tribu-green] text-sm">✓ Presente</span>
                  </div>
                  
                  {/* Voluntario 3 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-[--tribu-orange-light] text-[--tribu-orange] flex items-center justify-center font-medium text-sm mr-2">LR</div>
                      <span className="text-sm">Luis Ramírez</span>
                    </div>
                    <span className="text-[--tribu-gray] text-sm">Pendiente</span>
                  </div>
                </div>
              </div>
              
              {/* Contador de horas */}
              <div className="bg-[--tribu-blue-light]/50 rounded-xl p-4 text-center">
                <h4 className="text-[--tribu-navy] font-medium mb-1 text-sm">Horas de impacto generadas</h4>
                <div className="text-[--tribu-blue] text-4xl font-bold">127</div>
                <p className="text-xs text-[--tribu-gray] mt-1">Este mes: +42 horas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
// components/landing/Testimonials.tsx
// Sección de testimonios con carousel automático

"use client";

import { useRef, useEffect, useState } from 'react';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

interface TestimonialsProps {}

export const Testimonials: React.FC<TestimonialsProps> = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const testimonialRefs = useRef<(HTMLDivElement | null)[]>([]);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Datos de testimonios
  const testimonials: Testimonial[] = [
    {
      quote: "Llevábamos 5 años con Excel y WhatsApp. Sabemos que hay voluntarios talentosos pero no podemos rastrearlos. Si hubiera una herramienta así cuando empezamos, seríamos el doble de grandes hoy.",
      author: "Ana M.",
      role: "Directora de ONG educativa, Santo Domingo"
    },
    {
      quote: "Hice 120 horas de labor social y no tengo nada que mostrar en mi CV excepto una firma en papel. Necesito algo que le diga a un empleador lo que realmente aprendí.",
      author: "Carlos R.",
      role: "Estudiante de Mercadeo, PUCMM"
    },
    {
      quote: "Nuestros aliados en ONGs no tienen los datos que necesitamos para nuestros reportes ESG. Tenemos la voluntad de apoyar, pero sin métricas auditables, no podemos justificar la inversión.",
      author: "María T.",
      role: "Coordinadora de RSC, empresa del sector privado"
    }
  ];
  
  // Avanzar al siguiente testimonio
  const goToNext = () => {
    setActiveIndex((current) => 
      current === testimonials.length - 1 ? 0 : current + 1
    );
  };
  
  // Ir a un testimonio específico
  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };
  
  // Configurar autoplay
  useEffect(() => {
    // Iniciar o reiniciar temporizador cuando cambia activeIndex o isPaused
    if (!isPaused) {
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
      }
      
      autoplayTimerRef.current = setTimeout(goToNext, 6000);
    }
    
    return () => {
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
      }
    };
  }, [activeIndex, isPaused]);
  
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
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);
  
  return (
    <section 
      ref={sectionRef} 
      id="testimonials" 
      className="py-20 bg-[--tribu-light]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-4">
        <h2 className="h2-section text-[--tribu-navy] text-center mb-12">
          Voces de quienes conocen el problema
        </h2>
        
        <div className="max-w-4xl mx-auto mb-12 relative">
          {/* Comillas decorativas */}
          <div className="text-[--tribu-blue] opacity-15 absolute top-0 left-0 transform -translate-x-4 -translate-y-8 text-8xl font-serif">
            "
          </div>
          
          {/* Carousel de testimonios */}
          <div className="relative h-80 md:h-64">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                ref={(el: HTMLDivElement | null) => { testimonialRefs.current[index] = el; }}
                className={`absolute inset-0 transition-all duration-500 flex flex-col justify-center ${
                  activeIndex === index 
                    ? 'opacity-100 translate-x-0 z-10' 
                    : 'opacity-0 translate-x-12 -z-10'
                }`}
              >
                <div className="bg-white p-8 rounded-xl shadow-sm border-l-4 border-[--tribu-peach]">
                  <p className="text-[--tribu-dark] text-lg md:text-xl leading-relaxed mb-6">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <p className="font-bold text-[--tribu-navy]">{testimonial.author}</p>
                    <p className="text-[--tribu-gray] text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Indicadores de navegación */}
          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  activeIndex === index 
                    ? 'bg-[--tribu-blue] w-6' 
                    : 'bg-[--tribu-blue]/30'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        <p className="text-[--tribu-gray] text-sm text-center max-w-3xl mx-auto">
          *Testimonios representativos basados en investigación de campo con directores de ONGs y voluntarios universitarios en RD.
        </p>
      </div>
    </section>
  );
};

export default Testimonials;
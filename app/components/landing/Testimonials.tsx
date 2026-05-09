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
      className="py-24 md:py-32 bg-[#0a0a09] text-[#e8e8e2] font-mono border-b border-white/10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-[#8a8a82] uppercase mb-16 justify-center">
          <span className="text-[--tribu-blue]">#</span> TESTIMONIOS
        </div>

        <h2 className="text-4xl md:text-5xl font-sans uppercase tracking-wide leading-[1.1] font-bold mb-16 text-center">
          Voces en <em className="bg-[#e8e8e2] text-[#0a0a09] px-2 not-italic inline-block">código</em>.
        </h2>
        
        <div className="max-w-4xl mx-auto mb-12 relative">
          
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
                <div className="bg-[#111110] p-10 border border-white/10 border-l-4 border-l-[--tribu-yellow]">
                  <p className="text-[#e8e8e2] text-lg md:text-xl leading-relaxed mb-8">
                    <span className="text-[--tribu-blue] mr-2">{'>'}</span> 
                    &quot;{testimonial.quote}&quot;
                  </p>
                  <div>
                    <p className="font-bold text-[#e8e8e2] uppercase tracking-wide">{testimonial.author}</p>
                    <p className="text-[#8a8a82] text-xs mt-1">{testimonial.role}</p>
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
                    : 'bg-white/20'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        <p className="text-white/30 text-[10px] uppercase tracking-widest text-center mt-12 max-w-3xl mx-auto">
          *Testimonios representativos basados en investigación de campo con directores de ONGs y voluntarios universitarios en RD.
        </p>
      </div>
    </section>
  );
};

export default Testimonials;
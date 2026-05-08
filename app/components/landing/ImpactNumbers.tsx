// components/landing/ImpactNumbers.tsx
// Sección que muestra métricas de impacto con contadores animados

"use client";

import { useRef, useEffect, useState } from 'react';

interface CounterProps {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  decimalPlaces?: number;
}

// Componente de contador animado
const AnimatedCounter: React.FC<CounterProps> = ({
  end,
  suffix = '',
  prefix = '',
  duration = 1500,
  decimalPlaces = 0,
}) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLDivElement>(null);
  const multiplier = decimalPlaces > 0 ? Math.pow(10, decimalPlaces) : 1;
  
  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;
    let observer: IntersectionObserver;
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = easeOutQuart(progress);
      
      // Usar multiplicador para manejar decimales correctamente
      const currentCount = Math.floor(easedProgress * end * multiplier) / multiplier;
      setCount(currentCount);
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };
    
    // Función para iniciar la animación
    const startAnimation = () => {
      cancelAnimationFrame(animationFrameId);
      startTimestamp = null;
      animationFrameId = requestAnimationFrame(step);
    };
    
    // Comenzar animación cuando el componente entra en viewport
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          startAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (countRef.current) {
      observer.observe(countRef.current);
    }
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [end, duration, multiplier]);
  
  // Función de easing para hacer la animación más natural
  const easeOutQuart = (x: number): number => {
    return 1 - Math.pow(1 - x, 4);
  };
  
  // Formatear el número según los decimales requeridos
  const formattedCount = count.toFixed(decimalPlaces);
  
  return (
    <div ref={countRef} className="font-bold text-5xl md:text-7xl text-white">
      {prefix}{formattedCount}{suffix}
    </div>
  );
};

interface ImpactNumbersProps {}

export const ImpactNumbers: React.FC<ImpactNumbersProps> = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const statsRef = useRef<(HTMLDivElement | null)[]>([]);
  
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
    
    // Observar cada estadística con un delay staggered
    statsRef.current.forEach((stat, index) => {
      if (stat) {
        // Agregar transparencia inicial
        stat.style.opacity = '0';
        stat.style.transform = 'translateY(20px)';
        
        // Configurar animación con delay staggered
        setTimeout(() => {
          observer.observe(stat);
        }, 150 * index);
      }
    });
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
      statsRef.current.forEach((stat) => {
        if (stat) {
          observer.unobserve(stat);
        }
      });
    };
  }, []);
  
  // Datos de métricas
  const impactStats = [
    {
      value: 862,
      suffix: 'M+',
      label: 'Personas que realizan voluntariado mensualmente en el mundo',
    },
    {
      value: 70,
      suffix: '%',
      label: 'Del voluntariado es informal — sin registro ni reconocimiento',
    },
    {
      value: 10,
      suffix: 'h',
      label: 'Para obtener tu primer certificado de habilidades en TRIBU',
    },
    {
      value: 95,
      prefix: '+',
      suffix: '%',
      label: 'Tasa de asistencia registrada exitosamente vía QR en pilotos',
    },
  ];
  
  return (
    <section 
      ref={sectionRef} 
      id="impact" 
      className="py-20 bg-[--tribu-navy]"
    >
      <div className="container mx-auto px-4">
        <h2 className="h2-section text-white text-center mb-16">
          El impacto social que se puede medir, crece
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 max-w-6xl mx-auto mb-12">
          {impactStats.map((stat, index) => (
            <div
              key={index}
              ref={(el: HTMLDivElement | null) => { statsRef.current[index] = el; }}
              className="text-center transition-all duration-500"
              style={{
                opacity: 0,
                transform: 'translateY(20px)',
                transitionDelay: `${index * 150}ms`,
              }}
            >
              <AnimatedCounter 
                end={stat.value} 
                suffix={stat.suffix} 
                prefix={stat.prefix} 
                duration={1500}
              />
              <p className="text-white/80 mt-4 max-w-[250px] mx-auto">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
        
        <p className="text-white/60 text-sm text-center max-w-3xl mx-auto">
          *Datos basados en el Informe sobre el Estado del Voluntariado en el Mundo 2022, ONU Voluntarios.
        </p>
      </div>
    </section>
  );
};

export default ImpactNumbers;
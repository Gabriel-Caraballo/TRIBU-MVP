// components/landing/Pricing.tsx
// Sección de precios con planes gratuito y profesional

"use client";

import Link from 'next/link';
import { useRef, useEffect } from 'react';

interface PricingTier {
  badge?: string;
  title: string;
  price: string;
  priceDetail?: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  highlighted?: boolean;
  borderColor: string;
}

interface PricingProps {}

export const Pricing: React.FC<PricingProps> = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const tiersRef = useRef<(HTMLDivElement | null)[]>([]);
  
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
    
    // Observar cada plan con un delay staggered
    tiersRef.current.forEach((tier, index) => {
      if (tier) {
        // Agregar transparencia inicial
        tier.style.opacity = '0';
        tier.style.transform = 'translateY(20px)';
        
        // Configurar animación con delay staggered
        setTimeout(() => {
          observer.observe(tier);
        }, 150 * index);
      }
    });
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
      tiersRef.current.forEach((tier) => {
        if (tier) {
          observer.unobserve(tier);
        }
      });
    };
  }, []);
  
  // Datos de los planes
  const pricingTiers: PricingTier[] = [
    {
      badge: 'Perfecto para empezar',
      title: 'Plan Gratuito',
      price: 'RD$0 / mes',
      features: [
        'Hasta 3 actividades activas simultáneas',
        'Hasta 30 voluntarios registrados',
        'QR dinámico para asistencia',
        'Perfiles de voluntarios con habilidades',
        'Dashboard básico de métricas'
      ],
      ctaText: 'Comenzar gratis',
      ctaLink: '/auth/register',
      borderColor: '#e8e8e220' // white/10 aprox
    },
    {
      badge: 'Recomendado',
      title: 'Plan Profesional',
      price: 'RD$2,500 / mes',
      priceDetail: '~USD$42/mes · Cancela cuando quieras',
      features: [
        'Actividades ilimitadas',
        'Voluntarios ilimitados',
        'Reportes ESG exportables',
        'Certificados automáticos con IA',
        'Soporte prioritario por WhatsApp',
        'Logo de tu ONG en los certificados'
      ],
      ctaText: 'Empezar prueba de 30 días',
      ctaLink: '/auth/register',
      highlighted: true,
      borderColor: 'var(--tribu-green)'
    }
  ];
  
  return (
    <section 
      ref={sectionRef} 
      id="pricing" 
      className="py-24 md:py-32 bg-[#0a0a09] text-[#e8e8e2] font-mono border-b border-white/10"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-[#8a8a82] uppercase mb-16 justify-center">
          <span className="text-[--tribu-green]">#</span> PLANES
        </div>

        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-sans uppercase tracking-wide leading-[1.1] font-bold mb-6">
            Escalable. <em className="bg-[#e8e8e2] text-[#0a0a09] px-2 not-italic inline-block">Justo</em>.
          </h2>
          <p className="text-xs text-[#8a8a82] max-w-2xl mx-auto tracking-widest uppercase">
            EMPIEZA GRATIS. ACTUALIZA SOLO SI LO NECESITAS.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <div
              key={index}
              ref={(el: HTMLDivElement | null) => { tiersRef.current[index] = el; }}
              className={`bg-[#111110] border overflow-hidden transition-all duration-500 ${
                tier.highlighted 
                  ? 'relative md:transform md:-translate-y-3' 
                  : ''
              }`}
              style={{
                opacity: 0,
                transform: 'translateY(20px)',
                transitionDelay: `${index * 150}ms`,
                borderColor: tier.borderColor,
              }}
            >
              {/* Badge si aplica */}
              {tier.badge && (
                <div className={`absolute top-4 right-4 ${tier.highlighted ? 'bg-[--tribu-green] text-white' : 'bg-white/10 text-[#e8e8e2]'} px-3 py-1 text-[10px] font-bold tracking-widest uppercase`}>
                  {tier.badge}
                </div>
              )}
              
              <div className="p-8">
                {/* Título */}
                <h3 className="text-2xl font-sans uppercase tracking-wide font-bold mb-4 text-[#e8e8e2]">
                  {tier.title}
                </h3>
                
                {/* Precio */}
                <div className="mb-6">
                  <div className="text-4xl font-bold font-sans tracking-tight text-[#e8e8e2]">{tier.price}</div>
                  {tier.priceDetail && (
                    <div className="text-[#8a8a82] text-xs mt-2">{tier.priceDetail}</div>
                  )}
                </div>
                
                {/* Características */}
                <ul className="space-y-4 mb-10">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <svg className={`w-5 h-5 ${tier.highlighted ? 'text-[--tribu-green]' : 'text-[#8a8a82]'} mr-3 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs text-[#8a8a82]">{feature}</span>
                    </li>
                  ))}
                </ul>
                
{/* CTA */}
                <Link
                  href="/auth/register"
                  className={`btn w-full ${
                    tier.highlighted 
                      ? 'bg-[--tribu-green] text-white hover:bg-[#e8e8e2] hover:text-[#0a0a09] transition-colors py-4 inline-block text-center text-xs font-bold tracking-widest uppercase' 
                      : 'border border-white/10 text-[#e8e8e2] hover:bg-white/5 transition-colors py-4 inline-block text-center text-xs font-bold tracking-widest uppercase'
                  }`}
                >
                  {tier.ctaText}
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        {/* Nota empresas */}
        <div className="text-center mt-16 text-[#8a8a82] max-w-2xl mx-auto text-xs uppercase tracking-widest">
          <p>
            ¿Eres empresa y necesitas reportes certificados de impacto para tu programa de RSC? 
            <a 
              href="mailto:channel.oleo@gmail.com" 
              className="text-[#3b82f6] font-bold ml-1 hover:underline"
            >
              Escríbenos a channel.oleo@gmail.com
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
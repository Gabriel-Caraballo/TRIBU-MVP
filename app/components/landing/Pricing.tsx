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
      borderColor: '--tribu-gray'
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
      borderColor: '--tribu-blue'
    }
  ];
  
  return (
    <section 
      ref={sectionRef} 
      id="pricing" 
      className="py-20 bg-white"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="h2-section text-[--tribu-navy] mb-3">
            Simple, transparente, justo
          </h2>
          <p className="h3-subsection text-[--tribu-gray] max-w-2xl mx-auto">
            TRIBU crece contigo. Empieza gratis.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <div
              key={index}
              ref={(el: HTMLDivElement | null) => { tiersRef.current[index] = el; }}
              className={`rounded-xl border overflow-hidden transition-all duration-500 ${
                tier.highlighted 
                  ? 'shadow-lg relative md:transform md:-translate-y-3' 
                  : 'shadow-md'
              }`}
              style={{
                opacity: 0,
                transform: 'translateY(20px)',
                transitionDelay: `${index * 150}ms`,
                borderColor: `var(${tier.borderColor})`,
              }}
            >
              {/* Badge si aplica */}
              {tier.badge && (
                <div className={`absolute top-4 right-4 ${tier.highlighted ? 'bg-[--tribu-peach-light] text-[--tribu-orange]' : 'bg-[--tribu-blue-light] text-[--tribu-blue]'} px-3 py-1 rounded-full text-xs font-medium`}>
                  {tier.badge}
                </div>
              )}
              
              <div className="p-8">
                {/* Título */}
                <h3 className="text-2xl font-bold text-[--tribu-navy] mb-4">
                  {tier.title}
                </h3>
                
                {/* Precio */}
                <div className="mb-6">
                  <div className="text-4xl font-bold text-[--tribu-dark]">{tier.price}</div>
                  {tier.priceDetail && (
                    <div className="text-[--tribu-gray] text-sm mt-1">{tier.priceDetail}</div>
                  )}
                </div>
                
                {/* Características */}
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <svg className={`w-5 h-5 ${tier.highlighted ? 'text-[--tribu-blue]' : 'text-[--tribu-gray]'} mr-3 flex-shrink-0 mt-1`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[--tribu-gray]">{feature}</span>
                    </li>
                  ))}
                </ul>
                
{/* CTA */}
                <Link
                  href="/auth/register"
                  className={`btn w-full ${
                    tier.highlighted 
                      ? 'bg-[--tribu-blue] text-white hover:bg-[--tribu-navy]' 
                      : 'border border-[--tribu-gray] text-[--tribu-gray] hover:bg-gray-50'
                  }`}
                >
                  {tier.ctaText}
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        {/* Nota empresas */}
        <div className="text-center mt-10 text-[--tribu-gray] max-w-2xl mx-auto">
          <p>
            ¿Eres empresa y necesitas reportes certificados de impacto para tu programa de RSC? 
            <a 
              href="mailto:channel.oleo@gmail.com" 
              className="text-[--tribu-blue] font-medium ml-1 hover:underline"
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
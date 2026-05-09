// components/landing/Footer.tsx
// Pie de página con navegación, información de contacto y derechos de autor

import Link from 'next/link';
import Image from 'next/image';

interface FooterProps {}

export const Footer: React.FC<FooterProps> = () => {
  // Enlaces de navegación por columna
  const footerLinks = {
    producto: [
      { label: 'Cómo funciona', href: '#how-it-works' },
      { label: 'Para ONGs', href: '#for-ngos' },
      { label: 'Para Voluntarios', href: '#for-volunteers' },
      { label: 'Precios', href: '#pricing' },
    ],
    empresa: [
      { label: 'Sobre TRIBU', href: '#about' },
      { label: 'Contacto', href: 'mailto:channel.oleo@gmail.com' },
      { label: 'Política de privacidad', href: '#privacy' },
    ],
    contacto: [
      { label: 'channel.oleo@gmail.com', href: 'mailto:channel.oleo@gmail.com' },
      { label: 'Hackathon 2026', href: '#hackathon' },
    ]
  };
  
  return (
    <footer className="bg-[#0a0a09] text-[#8a8a82] py-16 font-mono">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Columna 1: Logo y tagline */}
          <div className="fade-in">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 relative mr-3 rounded-full overflow-hidden bg-[#111110]">
                <Image 
                  src="/logo.png"
                  alt="TRIBU Logo" 
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-bold text-xl font-sans uppercase tracking-widest text-[#e8e8e2]">TRIBU</span>
            </div>
            <p className="text-[#8a8a82] mb-3 text-xs leading-loose uppercase tracking-widest">Profesionalizando el impacto social.</p>
            <p className="text-white/30 text-[10px]">2026 Hackathon by República Dominicana</p>
          </div>
          
          {/* Columna 2: Producto */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest text-[#e8e8e2] mb-6">Producto</h3>
            <ul className="space-y-2">
              {footerLinks.producto.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href} 
                    className="text-xs hover:text-[--tribu-blue] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Columna 3: Empresa */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest text-[#e8e8e2] mb-6">Empresa</h3>
            <ul className="space-y-2">
              {footerLinks.empresa.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href} 
                    className="text-xs hover:text-[--tribu-blue] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Columna 4: Contacto */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest text-[#e8e8e2] mb-6">Contacto</h3>
            <ul className="space-y-2">
              {footerLinks.contacto.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href} 
                    className="text-xs hover:text-[--tribu-blue] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Línea divisoria */}
        <div className="border-t border-white/10 pt-8">
          <p className="text-center text-white/30 text-[10px] uppercase tracking-widest">
            &copy; 2026 TRIBU. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
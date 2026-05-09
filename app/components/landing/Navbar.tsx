// components/landing/Navbar.tsx
// Barra de navegación principal, sticky con cambio de apariencia al hacer scroll

"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Detecta cuando la página hace scroll para cambiar la apariencia
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 font-mono ${
        isScrolled 
          ? 'bg-[#0a0a09]/95 backdrop-blur-md border-b border-white/10 shadow-xl' 
          : 'bg-[#0a0a09]/50 backdrop-blur-sm border-b border-white/5'
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo y nombre */}
        <Link href="/" className="flex items-center space-x-2 z-10 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 relative rounded-full overflow-hidden bg-[#111110]">
            <Image 
              src="/logo.png"
              alt="TRIBU Logo" 
              fill
              className="object-cover"
              priority
            />
          </div>
          <span className="font-bold text-xl font-sans uppercase tracking-widest text-[#e8e8e2]">
            TRIBU
          </span>
        </Link>

        {/* Navegación en desktop */}
        <nav className="hidden md:flex items-center space-x-8">
          <ul className="flex space-x-8">
            {[
              { label: '¿Cómo funciona?', href: '#how-it-works' },
              { label: 'Para ONGs', href: '#for-ngos' },
              { label: 'Para Voluntarios', href: '#for-volunteers' },
              { label: 'Impacto', href: '#impact' },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                    isScrolled 
                      ? 'text-[#8a8a82] hover:text-[--tribu-blue]' 
                      : 'text-[#e8e8e2] hover:text-[--tribu-blue]'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Botones de acción */}
        <div className="hidden md:flex items-center space-x-3">
          <Link
            href="/auth/login"
            className="text-xs font-bold tracking-widest uppercase text-[#e8e8e2] hover:text-white px-5 py-2.5 transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/auth/register"
            className="text-xs font-bold tracking-widest uppercase bg-[--tribu-green] text-white px-6 py-2.5 hover:bg-[#e8e8e2] hover:text-[#0a0a09] transition-colors"
          >
            Registrarme
          </Link>
        </div>

        {/* Botón de hamburguesa para móvil */}
        <button 
          className="md:hidden z-10 w-10 h-10 flex flex-col justify-center items-center" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menu"
        >
          <span 
            className={`block w-6 h-0.5 transition-all transform duration-300 ease-in-out ${
              'bg-[#e8e8e2]'
            } ${isMenuOpen ? 'rotate-45 translate-y-1' : ''}`} 
          />
          <span 
            className={`block w-6 h-0.5 my-1 transition-opacity duration-300 ${
              'bg-[#e8e8e2]'
            } ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`} 
          />
          <span 
            className={`block w-6 h-0.5 transition-all transform duration-300 ease-in-out ${
              'bg-[#e8e8e2]'
            } ${isMenuOpen ? '-rotate-45 -translate-y-1' : ''}`} 
          />
        </button>

        {/* Menú móvil */}
        <div 
          className={`fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#0a0a09] space-y-6 p-4 transition-transform duration-300 ease-in-out transform md:hidden overflow-hidden ${
            isMenuOpen ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <ul className="flex flex-col items-center space-y-6">
            {[
              { label: '¿Cómo funciona?', href: '#how-it-works' },
              { label: 'Para ONGs', href: '#for-ngos' },
              { label: 'Para Voluntarios', href: '#for-volunteers' },
              { label: 'Impacto', href: '#impact' },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-[#e8e8e2] text-xl font-bold uppercase tracking-widest"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
<div className="flex flex-col space-y-4 w-full max-w-xs">
            <Link
              href="/auth/login"
              className="py-3 text-[#e8e8e2] border border-white/10 text-center w-full font-bold uppercase tracking-widest text-xs"
              onClick={() => setIsMenuOpen(false)}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/auth/register"
              className="py-3 bg-[--tribu-green] text-white text-center w-full font-bold uppercase tracking-widest text-xs"
              onClick={() => setIsMenuOpen(false)}
            >
              Registrarme
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
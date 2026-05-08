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
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-xl shadow-md' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo y nombre */}
        <Link href="/" className="flex items-center space-x-2 z-10">
          <div className="w-10 h-10 relative">
            <Image 
              src="/logo.png"
              alt="TRIBU Logo" 
              fill 
              className="object-contain"
              sizes="40px"
              priority
            />
          </div>
          <span className={`font-bold text-xl ${isScrolled ? 'text-[--tribu-navy]' : 'text-white'}`}>
            TRIBU
          </span>
        </Link>

        {/* Navegación en desktop */}
        <nav className="hidden md:flex items-center space-x-6">
          <ul className="flex space-x-6">
            {[
              { label: '¿Cómo funciona?', href: '#how-it-works' },
              { label: 'Para ONGs', href: '#for-ngos' },
              { label: 'Para Voluntarios', href: '#for-volunteers' },
              { label: 'Impacto', href: '#impact' },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`text-sm font-medium hover:opacity-80 transition-opacity ${
                    isScrolled ? 'text-[--tribu-gray]' : 'text-white'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

{/* Botones de acción */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            href="/auth/login"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              isScrolled
                ? 'text-[--tribu-blue] border-[--tribu-blue] hover:bg-[--tribu-blue-light]'
                : 'text-white border-white hover:bg-white/10'
            }`}
          >
            Iniciar sesión
          </Link>
          <Link
            href="/auth/register"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isScrolled
                ? 'bg-[--tribu-blue] text-white hover:bg-[--tribu-navy]'
                : 'bg-white text-[--tribu-navy] hover:bg-gray-100'
            }`}
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
              isScrolled ? 'bg-[--tribu-navy]' : 'bg-white'
            } ${isMenuOpen ? 'rotate-45 translate-y-1' : ''}`} 
          />
          <span 
            className={`block w-6 h-0.5 my-1 transition-opacity duration-300 ${
              isScrolled ? 'bg-[--tribu-navy]' : 'bg-white'
            } ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`} 
          />
          <span 
            className={`block w-6 h-0.5 transition-all transform duration-300 ease-in-out ${
              isScrolled ? 'bg-[--tribu-navy]' : 'bg-white'
            } ${isMenuOpen ? '-rotate-45 -translate-y-1' : ''}`} 
          />
        </button>

        {/* Menú móvil */}
        <div 
          className={`fixed inset-0 flex flex-col items-center justify-center bg-[--tribu-navy] space-y-6 p-4 transition-transform duration-300 ease-in-out transform ${
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
                  className="text-white text-xl font-medium"
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
              className="py-3 rounded-lg text-white border border-white text-center w-full font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/auth/register"
              className="py-3 rounded-lg bg-white text-[--tribu-navy] text-center w-full font-medium"
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
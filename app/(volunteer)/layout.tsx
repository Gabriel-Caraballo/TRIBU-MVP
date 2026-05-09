// app/(volunteer)/layout.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import VolunteerProfilePrompt from './components/VolunteerProfilePrompt';

interface VolunteerProfileData {
  id: string;
  user_id: string;
  bio: string | null;
  skills: string[] | null;
  university: string | null;
  career: string | null;
  total_hours: number;
  age: number | null;
  city: string | null;
}

export default function VolunteerLayout({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState('Voluntario');
  const [totalHours, setTotalHours] = useState(0);
  const [userLevel, setUserLevel] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Función para verificar si el perfil de voluntario está completo
  function isProfileComplete(volunteer: VolunteerProfileData): boolean {
    const hasBio = Boolean(volunteer.bio && volunteer.bio.trim() !== '');
    const hasSkills = Boolean(volunteer.skills && Array.isArray(volunteer.skills) && volunteer.skills.length > 0);
    const hasCity = Boolean(volunteer.city && volunteer.city.trim() !== '');
    return hasBio && hasSkills && hasCity;
  }

useEffect(() => {
    // Fetch volunteer data y verificar perfil
    async function fetchVolunteerData() {
      const supabase = createClient();
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Get user profile
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .single();
          
          if (profile) {
            setUserName(profile.full_name);
          }
          
          // Get volunteer profile - NO usar .single() para evitar error 406
          const { data: volunteerProfile, error: vpError } = await supabase
            .from('volunteer_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          // Si hay error o no existe el perfil, no hacer nada - el usuario puede no ser voluntario
          if (vpError || !volunteerProfile) {
            console.log('[VOLUNTEER LAYOUT] No volunteer profile found, skipping profile checks');
            setIsLoading(false);
            return;
          }
          
          if (volunteerProfile) {
            setTotalHours(volunteerProfile.total_hours);
            
            // Determine level based on hours
            if (volunteerProfile.total_hours >= 50) {
              setUserLevel('Experto');
            } else if (volunteerProfile.total_hours >= 10) {
              setUserLevel('Activo');
            } else {
              setUserLevel('Nuevo');
            }
            
            // Verificar si el perfil está completo
            const isComplete = isProfileComplete(volunteerProfile as VolunteerProfileData);
            setProfileComplete(isComplete);
            
            // Si el perfil no está completo y NO estamos ya en /profile, redirigir
            if (!isComplete && pathname !== '/profile') {
              router.push('/profile');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching volunteer data:', error);
      } finally {
        setIsLoading(false);
      }
    }
     
    fetchVolunteerData();
  }, [pathname, router]);

  // Mostrar pantalla de carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[--tribu-light]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[--tribu-blue]"></div>
      </div>
    );
  }

  // Si el perfil no está completo, mostrar overlay obligatorio
  // Solo mostrar si profileComplete es explicitamente false (perfil existe pero incompleto)
  if (profileComplete === false) {
    return (
      <div className="fixed inset-0 z-50 bg-[--tribu-light] overflow-auto">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <VolunteerProfilePrompt />
          </div>
        </div>
      </div>
    );
  }
  
  // Si profileComplete es null, significa que no es voluntario - mostrar UI normal
  // El middleware se encargará de redirigir si es necesario

  // Resto del código del layout existente...

  const navigationLinks = [
    { icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z', title: 'Feed', href: '/feed' },
    { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', title: 'Mis actividades', href: '/my-activities' },
    { icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z', title: 'Escanear QR', href: '/scan' },
    { icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', title: 'Mi perfil', href: '/profile' },
    { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: 'Certificados', href: '/certificates' },
  ];

  // Mobile navigation - 5 iconos para que quepa Escanear QR
  const mobileNavLinks = navigationLinks.slice(0, 5);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };

  return (
    <div className="flex flex-col h-screen bg-[--tribu-light]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-30">
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 flex items-center space-x-3">
            <div className="w-10 h-10 relative flex-shrink-0">
              <Image 
                src="/logo.png" 
                alt="TRIBU Logo" 
                fill 
                className="object-contain"
              />
            </div>
            <span className="font-bold text-xl text-[--tribu-navy]">TRIBU</span>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigationLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`group flex items-center px-4 py-3 rounded-md transition-colors ${
                    isActive
                      ? 'bg-[--tribu-blue-light] text-[--tribu-blue]' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <svg 
                    className={`mr-3 w-5 h-5 ${isActive ? 'text-[--tribu-blue]' : 'text-gray-500 group-hover:text-gray-700'}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} />
                  </svg>
                  {link.title}
                </Link>
              );
            })}
          </nav>
          
          {/* User info */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[--tribu-blue] text-white flex items-center justify-center font-bold text-lg">
                {userName.charAt(0)}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-[--tribu-dark]">{userName}</p>
                <div className="flex items-center text-xs">
                  <span className="bg-[--tribu-green-light] text-[--tribu-green] px-2 py-0.5 rounded-full font-medium">
                    {userLevel}
                  </span>
                  <span className="ml-2 text-[--tribu-gray]">
                    {totalHours} horas
                  </span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="mt-4 w-full flex items-center px-4 py-2 rounded-md text-[--tribu-dark] hover:bg-gray-100 transition-colors text-sm"
            >
              <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 lg:ml-64 pt-0 pb-16 lg:pb-0">
        <div className="container mx-auto p-4 h-full">
          {children}
        </div>
      </main>
      
      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="grid grid-cols-4 h-16">
          {mobileNavLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`flex flex-col items-center justify-center ${
                  isActive ? 'text-[--tribu-blue]' : 'text-gray-500'
                }`}
              >
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} />
                </svg>
                <span className="text-xs mt-1">{link.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
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
      <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#22c55e]"></div>
      </div>
    );
  }

  // Si el perfil no está completo, mostrar overlay obligatorio
  // Solo mostrar si profileComplete es explicitamente false (perfil existe pero incompleto)
  if (profileComplete === false) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0a0a0a] overflow-auto">
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
    { icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', title: 'Dashboard', href: '/volunteer-dashboard' },
    { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', title: 'Mis actividades', href: '/my-activities' },
    { icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', title: 'Mi perfil', href: '/profile' },
    { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: 'Certificados', href: '/certificates' },
    { icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z', title: 'Feed', href: '/feed' },
    { icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z', title: 'Escanear QR', href: '/scan' },
  ];

  // Mobile navigation - 5 iconos para que quepa Escanear QR
  const mobileNavLinks = navigationLinks.slice(0, 5);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-[#0f0f0f] border-r border-[#1f1f1f] z-30">
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 flex items-center space-x-3">
            <div className="w-10 h-10 relative rounded-full overflow-hidden bg-[#111110] flex-shrink-0">
              <Image
                src="/logo.png"
                alt="TRIBU Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <span className="font-bold text-xl text-white tracking-widest">TRIBU</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4">
            <p className="text-[9px] text-[#333] tracking-[0.14em] px-4 pb-2 pt-1">
              MI ESPACIO
            </p>
            {navigationLinks.slice(0, 4).map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group flex items-center px-4 py-3 transition-colors border-l-2 ${
                    isActive
                      ? 'border-[#22c55e] bg-[rgba(34,197,94,0.08)] text-[#22c55e]'
                      : 'border-transparent text-[#555] hover:text-[#aaa] hover:bg-[#161616]'
                  }`}
                >
                  <svg
                    className={`mr-3 w-5 h-5 ${isActive ? 'text-[#22c55e]' : 'text-[#444] group-hover:text-[#777]'}`}
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
            <p className="text-[9px] text-[#333] tracking-[0.14em] px-4 pb-2 pt-4">
              EXPLORAR
            </p>
            {navigationLinks.slice(4).map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group flex items-center px-4 py-3 transition-colors border-l-2 ${
                    isActive
                      ? 'border-[#22c55e] bg-[rgba(34,197,94,0.08)] text-[#22c55e]'
                      : 'border-transparent text-[#333] hover:text-[#555] hover:bg-[#161616]'
                  }`}
                >
                  <svg
                    className={`mr-3 w-5 h-5 ${isActive ? 'text-[#22c55e]' : 'text-[#333] group-hover:text-[#555]'}`}
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
          <div className="border-t border-[#1f1f1f] p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#22c55e] text-black flex items-center justify-center font-bold text-lg">
                {userName.charAt(0)}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{userName}</p>
                <div className="flex items-center text-xs">
                  <span className="text-[#22c55e] text-xs">
                    {userLevel}
                  </span>
                  <span className="ml-2 text-[#555]">
                    {totalHours} horas
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="mt-4 w-full flex items-center px-4 py-2 rounded-md text-[#444] hover:bg-[#161616] hover:text-[#aaa] transition-colors text-sm"
            >
              <svg className="w-5 h-5 mr-2 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0f0f0f] border-t border-[#1f1f1f] z-30">
        <div className="grid grid-cols-4 h-16">
          {mobileNavLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center ${isActive ? 'text-[#22c55e]' : 'text-[#444]'
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
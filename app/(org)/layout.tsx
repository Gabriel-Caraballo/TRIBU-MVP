// app/(org)/layout.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import OrgProfilePrompt from './components/OrgProfilePrompt';

interface OrganizationProfile {
  id: string;
  name: string;
  description: string | null;
  mission: string | null;
  vision: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  category: string | null;
  website: string | null;
  contact_email: string | null;
  logo_url: string | null;
}

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [organizationName, setOrganizationName] = useState('Mi Organización');
  const [isLoading, setIsLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // Función para verificar si el perfil está completo
  function isProfileComplete(org: OrganizationProfile): boolean {
    const requiredFields = [
      org.description,
      org.mission,
      org.phone,
      org.address,
      org.city,
      org.category
    ];
    return requiredFields.every(field => field && field.trim() !== '');
  }

  useEffect(() => {
    // Fetch organization data y verificar perfil
    async function fetchOrgData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          const { data: orgMembers } = await supabase
            .from('org_members')
            .select('org_id')
            .eq('user_id', session.user.id)
            .single();

          if (orgMembers) {
            setOrgId(orgMembers.org_id);

            const { data: org } = await supabase
              .from('organizations')
              .select('*')
              .eq('id', orgMembers.org_id)
              .single();

            if (org) {
              setOrganizationName(org.name);

              // Verificar si el perfil está completo
              const isComplete = isProfileComplete(org as OrganizationProfile);
              setProfileComplete(isComplete);

              // NO redirigir a /profile - el overlay ya mostrará OrgProfilePrompt si está incompleto
              // if (!isComplete && pathname !== '/profile') {
              //   router.push('/profile');
              // }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching organization data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrgData();
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
  if (profileComplete === false) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0a0a0a] overflow-auto">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <OrgProfilePrompt />
          </div>
        </div>
      </div>
    );
  }

  // Resto del código del layout existente...

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const navigationLinks = [
    { icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', title: 'Inicio', href: '/dashboard' },
    { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', title: 'Actividades', href: '/activities' },
    { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', title: 'Voluntarios', href: '/volunteers' },
    { icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', title: 'Reportes', href: '/reports' },
  ];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a]">
      {/* Mobile nav */}
      <div className="fixed top-0 left-0 right-0 z-20 lg:hidden">
        <div className="bg-[#0d0d0d] border-b border-[#1f1f1f] p-4 flex justify-between items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-[#444] hover:bg-[#161616]"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isSidebarOpen
                  ? "M6 18L18 6M6 6l12 12"
                  : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
          <div className="flex items-center">
            <div className="w-8 h-8 relative mr-2 rounded-full overflow-hidden bg-[#111110]">
              <Image
                src="/logo.png"
                alt="TRIBU Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <span className="font-bold text-white tracking-widest">TRIBU</span>
          </div>
        </div>
      </div>

      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-20 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Desktop sidebar - colapsable */}
      <aside className={`hidden lg:block fixed inset-y-0 left-0 bg-[#0d0d0d] border-r border-[#1f1f1f] z-30 transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="h-full flex flex-col relative">

          {/* Botón toggle colapso */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-10 w-6 h-6 bg-[#22c55e] rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform z-50"
          >
            <svg
              className={`w-4 h-4 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Logo */}
          <div className={`p-6 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-10 h-10 relative rounded-full overflow-hidden bg-[#111110] flex-shrink-0">
              <Image src="/logo.png" alt="TRIBU Logo" fill className="object-cover" priority />
            </div>
            {!isSidebarCollapsed && (
              <span className="font-bold text-xl text-white tracking-widest">TRIBU</span>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigationLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeSidebar}
                  className={`group flex items-center px-4 py-3 transition-all border-l-2 ${
                    isActive
                      ? 'border-[#22c55e] bg-[rgba(34,197,94,0.08)] text-[#22c55e]'
                      : 'border-transparent text-[#555] hover:text-[#aaa] hover:bg-[#161616]'
                  }`}
                >
                  <svg
                    className={`flex-shrink-0 w-5 h-5 ${isSidebarCollapsed ? 'mx-auto' : 'mr-3'} ${
                      isActive ? 'text-[#22c55e]' : 'text-[#444] group-hover:text-[#777]'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} />
                  </svg>
                  {!isSidebarCollapsed && (
                    <span className="text-sm truncate">{link.title}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="border-t border-[#1f1f1f] p-4">
            <div className={`flex items-center mb-4 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-[#22c55e] text-black flex items-center justify-center font-bold text-lg flex-shrink-0">
                {organizationName.charAt(0)}
              </div>
              {!isSidebarCollapsed && (
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-medium text-white truncate">{organizationName}</p>
                  <p className="text-xs text-[#555]">ONG / Organización</p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className={`flex items-center w-full text-[#444] hover:text-red-500 transition-colors ${
                isSidebarCollapsed ? 'justify-center' : 'px-4'
              }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {!isSidebarCollapsed && <span className="ml-2 text-sm">Cerrar sesión</span>}
            </button>
          </div>

        </div>
      </aside>

      {/* Mobile sidebar - deslizable */}
      <aside
        className={`lg:hidden fixed top-0 left-0 z-30 h-full w-64 bg-[#0d0d0d] border-r border-[#1f1f1f] transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300`}
      >
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
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigationLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group flex items-center px-4 py-3 rounded-md transition-colors ${isActive
                      ? 'text-[#22c55e] bg-[rgba(34,197,94,0.08)] border-l-2 border-[#22c55e] rounded-none'
                      : 'text-[#555] hover:text-[#aaa] hover:bg-[#161616] border-l-2 border-transparent'
                    }`}
                  onClick={closeSidebar}
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
          </nav>

          {/* User info */}
          <div className="border-t border-[#1f1f1f] p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#22c55e] text-black flex items-center justify-center font-bold text-lg">
                {organizationName.charAt(0)}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{organizationName}</p>
                <p className="text-xs text-[#555]">ONG / Organización</p>
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
      <main className={`flex-1 pt-14 lg:pt-0 transition-all duration-300 ${
        isSidebarOpen ? 'overflow-hidden' : 'overflow-auto'
      } ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <div className="container mx-auto p-4 h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
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
      <div className="flex items-center justify-center h-screen bg-[--tribu-light]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[--tribu-blue]"></div>
      </div>
    );
  }

  // Si el perfil no está completo, mostrar overlay obligatorio
  if (profileComplete === false) {
    return (
      <div className="fixed inset-0 z-50 bg-[--tribu-light] overflow-auto">
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
    <div className="flex h-screen bg-[--tribu-light]">
      {/* Mobile nav */}
      <div className="fixed top-0 left-0 right-0 z-20 lg:hidden">
        <div className="bg-white shadow-sm p-4 flex justify-between items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
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
            <div className="w-8 h-8 relative mr-2">
              <Image 
                src="/logo.png" 
                alt="TRIBU Logo" 
                fill 
                className="object-contain"
              />
            </div>
            <span className="font-bold text-[--tribu-navy]">TRIBU</span>
          </div>
        </div>
      </div>
      
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-white shadow-lg transform lg:translate-x-0 transition-transform ease-in-out duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:z-0`}
      >
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
                  onClick={closeSidebar}
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
                {organizationName.charAt(0)}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-[--tribu-dark]">{organizationName}</p>
                <p className="text-xs text-gray-500">ONG / Organización</p>
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
      <main className={`flex-1 pt-14 lg:pt-0 ${isSidebarOpen ? 'overflow-hidden' : 'overflow-auto'}`}>
        <div className="container mx-auto p-4 h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
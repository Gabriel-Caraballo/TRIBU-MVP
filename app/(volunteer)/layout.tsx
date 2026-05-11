// app/(volunteer)/layout.tsx
"use client";

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import VolunteerProfilePrompt from './components/VolunteerProfilePrompt';
import VolunteerNavbar from './components/VolunteerNavbar';

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

  // Estado para controlar el colapso desde el layout
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  function isProfileComplete(volunteer: VolunteerProfileData): boolean {
    const hasBio = Boolean(volunteer.bio && volunteer.bio.trim() !== '');
    const hasSkills = Boolean(volunteer.skills && Array.isArray(volunteer.skills) && volunteer.skills.length > 0);
    const hasCity = Boolean(volunteer.city && volunteer.city.trim() !== '');
    return hasBio && hasSkills && hasCity;
  }

  useEffect(() => {
    async function fetchVolunteerData() {
      const supabase = createClient();
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single();

        if (profile) setUserName(profile.full_name);

        const { data: volunteerProfile } = await supabase
          .from('volunteer_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (volunteerProfile) {
          setTotalHours(volunteerProfile.total_hours);
          setUserLevel(volunteerProfile.total_hours >= 50 ? 'Experto' : volunteerProfile.total_hours >= 10 ? 'Activo' : 'Nuevo');

          const isComplete = isProfileComplete(volunteerProfile as VolunteerProfileData);
          setProfileComplete(isComplete);

          // Redirección suave si el perfil está incompleto
          if (!isComplete && pathname !== '/profile') {
            router.push('/profile');
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

  // Handler para la carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#22c55e]"></div>
      </div>
    );
  }

  // Handler para perfil incompleto
  if (profileComplete === false) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0a0a0a] overflow-auto flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <VolunteerProfilePrompt />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] no-scrollbar">
      {/* Pasamos el estado y la función de toggle al Navbar */}
      <VolunteerNavbar
        userName={userName}
        userLevel={userLevel}
        totalHours={totalHours}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 
          El margen izquierdo (ml) ahora es dinámico:
          - En desktop (lg): ml-20 si está colapsado, ml-64 si no.
          - La transición (duration-300) hace que el contenido se desplace suavemente.
      */}
      <main
        className={`flex-1 transition-all duration-300 pt-0 pb-20 lg:pb-0 no-scrollbar
          ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}
      >
        <div className="container mx-auto p-4 h-full">
          {children}
        </div>
      </main>
    </div>
  );
}

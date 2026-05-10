// app/(volunteer)/my-activities/page.tsx
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface RegisteredActivity {
  id: string;
  activity_id: string;
  status: string;
  activity?: {
    title: string;
    description: string;
    location: string;
    start_time: string;
    end_time: string;
    status: string;
    organization?: { name: string };
  };
}

const statusLabels: Record<string, { label: string; color: string }> = {
  registered: { label: 'Registrado', color: 'bg-[rgba(34,197,94,0.1)] text-[#22c55e] border border-[rgba(34,197,94,0.2)]' },
  attended: { label: 'Asistió', color: 'bg-[rgba(34,197,94,0.1)] text-[#22c55e] border border-[rgba(34,197,94,0.2)]' },
  absent: { label: 'Inasistente', color: 'bg-[rgba(239,68,68,0.1)] text-red-400 border border-[rgba(239,68,68,0.2)]' },
  cancelled: { label: 'Cancelado', color: 'bg-[#161616] text-[#444] border border-[#1f1f1f]' }
};

const activityStatusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: 'Borrador', color: 'bg-[#161616] text-[#555] border border-[#1f1f1f]' },
  open: { label: 'Abierta', color: 'bg-[rgba(34,197,94,0.1)] text-[#22c55e] border border-[rgba(34,197,94,0.2)]' },
  in_progress: { label: 'En progreso', color: 'bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border border-[rgba(245,158,11,0.2)]' },
  completed: { label: 'Completada', color: 'bg-[rgba(34,197,94,0.1)] text-[#22c55e] border border-[rgba(34,197,94,0.2)]' },
  cancelled: { label: 'Cancelada', color: 'bg-[rgba(239,68,68,0.1)] text-red-400 border border-[rgba(239,68,68,0.2)]' }
};

export default function MyActivitiesPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<RegisteredActivity[]>([]);

  useEffect(() => {
    fetchMyActivities();
  }, []);

  async function fetchMyActivities() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No session found');
        setLoading(false);
        return;
      }

      console.log('User ID:', session.user.id);

      // Get all registrations for this volunteer with activity details
      const { data: registrations, error } = await supabase
        .from('activity_registrations')
        .select('*')
        .eq('volunteer_id', session.user.id);

      console.log('Registrations:', registrations, 'Error:', error);

      if (!registrations || registrations.length === 0) {
        setActivities([]);
        setLoading(false);
        return;
      }

      // Get activity IDs
      const activityIds = registrations.map(r => r.activity_id);

      // Get activities data
      const { data: activitiesData } = await supabase
        .from('activities')
        .select('*')
        .in('id', activityIds);

      // Get organization IDs
      const orgIds = Array.from(new Set((activitiesData || []).map(a => a.org_id)));

      // Get organizations
      const { data: orgsData } = await supabase
        .from('organizations')
        .select('id, name')
        .in('id', orgIds);

      const orgMap = new Map();
      (orgsData || []).forEach(o => orgMap.set(o.id, o.name));

      // Transform data
      const transformed = registrations.map(reg => {
        const activity = activitiesData?.find(a => a.id === reg.activity_id);
        return {
          id: reg.id,
          activity_id: reg.activity_id,
          status: reg.status,
          activity: {
            ...activity,
            organization_name: activity ? orgMap.get(activity.org_id) : 'ONG'
          }
        };
      });

      console.log('Transformed activities:', transformed);
      setActivities(transformed as any);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-DO', { 
      weekday: 'short',
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  function getHours(startTime: string, endTime: string) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return hours.toFixed(1);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#22c55e]"></div>
      </div>
    );
  }

  // Separate activities by status
  const upcomingActivities = activities.filter(a => 
    a.activity?.status === 'open' || a.activity?.status === 'in_progress'
  );
  const pastActivities = activities.filter(a => 
    a.activity?.status === 'completed' || a.activity?.status === 'cancelled'
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            Mis Actividades
          </h1>
          <p className="text-[#555] mt-2">
            Gestiona tu voluntariado
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#111] rounded-xl border border-[#1f1f1f] p-4 lg:p-6">
            <div className="text-2xl lg:text-3xl font-bold text-[#22c55e]">{activities.length}</div>
            <div className="text-xs text-[#555]">Total registradas</div>
          </div>
          <div className="bg-[#111] rounded-xl border border-[#1f1f1f] p-4 lg:p-6">
            <div className="text-2xl lg:text-3xl font-bold text-[#22c55e]">{upcomingActivities.length}</div>
            <div className="text-xs text-[#555]">Próximas</div>
          </div>
          <div className="bg-[#111] rounded-xl border border-[#1f1f1f] p-4 lg:p-6">
            <div className="text-2xl lg:text-3xl font-bold text-[#aaa]">{pastActivities.length}</div>
            <div className="text-xs text-[#555]">Completadas</div>
          </div>
          <div className="bg-[#111] rounded-xl border border-[#1f1f1f] p-4 lg:p-6">
            <div className="text-2xl lg:text-3xl font-bold text-[#f59e0b]">
              {activities.filter(a => a.status === 'registered').length}
            </div>
            <div className="text-xs text-[#555]">Pendientes</div>
          </div>
        </div>

        {/* Upcoming Activities */}
        {upcomingActivities.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">
              Próximas Actividades
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {upcomingActivities.map((reg) => (
                <div key={reg.id} className="bg-[#111] rounded-xl border border-[#1f1f1f] hover:border-[#2a2a2a] overflow-hidden">
                  <div className={`${
                    reg.status === 'registered' 
                      ? 'bg-[rgba(34,197,94,0.12)] text-[#22c55e]' 
                      : 'bg-[rgba(34,197,94,0.12)] text-[#22c55e]'
                  } px-4 py-2 text-sm font-medium`}>
                    <span className="font-medium">{statusLabels[reg.status]?.label}</span>
                  </div>
                  
                  <div className="p-4 lg:p-5">
                    <div className="flex items-center mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#161616] text-[#555] border border-[#1f1f1f]">
                        {(reg.activity as any)?.organization_name || 'ONG'}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                      {reg.activity?.title}
                    </h3>
                    
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-start text-[#555]">
                        <svg className="w-4 h-4 text-[#444] flex-shrink-0 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <p className="font-medium text-[#aaa]">{formatDate(reg.activity?.start_time || '')}</p>
                          <p className="text-xs text-[#555]">
                            {reg.activity?.start_time && reg.activity?.end_time 
                              ? `${getHours(reg.activity.start_time, reg.activity.end_time)} horas`
                              : ''}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start text-[#555]">
                        <svg className="w-4 h-4 text-[#444] flex-shrink-0 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="line-clamp-1">{reg.activity?.location || 'Sin ubicación'}</span>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="mb-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        reg.activity?.status === 'draft' ? 'bg-[#161616] text-[#555] border border-[#1f1f1f]' :
                        reg.activity?.status === 'open' ? 'bg-[rgba(34,197,94,0.1)] text-[#22c55e] border border-[rgba(34,197,94,0.2)]' :
                        reg.activity?.status === 'in_progress' ? 'bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border border-[rgba(245,158,11,0.2)]' :
                        reg.activity?.status === 'completed' ? 'bg-[rgba(34,197,94,0.1)] text-[#22c55e] border border-[rgba(34,197,94,0.2)]' :
                        'bg-[rgba(239,68,68,0.1)] text-red-400 border border-[rgba(239,68,68,0.2)]'
                      }`}>
                        {activityStatusLabels[reg.activity?.status || 'draft']?.label}
                      </span>
                    </div>
                    
                    {/* Action - Show scan button when activity is completed */}
                    {reg.activity?.status === 'completed' && reg.status === 'registered' && (
                      <Link 
                        href="/scan"
                        className="block w-full py-3 bg-[#22c55e] text-black text-center rounded-lg font-bold hover:bg-[#16a34a] transition-colors"
                      >
                        Escanear QR para acreditar horas
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Activities */}
        {pastActivities.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">
              Actividades Completadas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {pastActivities.map((reg) => (
                <div key={reg.id} className="bg-[#111] rounded-xl border border-[#1f1f1f] overflow-hidden opacity-60">
                  <div className="bg-[#161616] text-[#444] px-4 py-2">
                    <span className="font-medium">{statusLabels[reg.status]?.label}</span>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#161616] text-[#444] border border-[#1f1f1f]">
                        {(reg.activity as any)?.organization_name || 'ONG'}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-[#aaa] mb-2">
                      {reg.activity?.title}
                    </h3>
                    
                    <div className="text-sm text-[#444]">
                      <p>{formatDate(reg.activity?.start_time || '')}</p>
                      <p>{getHours(reg.activity?.start_time || '', reg.activity?.end_time || '')} horas</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {activities.length === 0 && (
          <div className="text-center py-12 bg-[#111] rounded-xl border border-[#1f1f1f]">
            <h3 className="text-xl font-bold text-white">Aún no tienes actividades</h3>
            <p className="text-[#555] mt-2 mb-6">
              Explora el feed para encontrar oportunidades de voluntariado
            </p>
            <Link 
              href="/feed"
              className="inline-block px-6 py-3 bg-[#22c55e] text-black rounded-lg font-semibold hover:bg-[#16a34a] transition-colors"
            >
              Explorar Actividades →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
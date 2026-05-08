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
  registered: { label: 'Registrado', color: 'bg-blue-100 text-blue-800' },
  attended: { label: 'Asistió', color: 'bg-green-100 text-green-800' },
  absent: { label: 'Inasistente', color: 'bg-red-100 text-red-800' },
  cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800' }
};

const activityStatusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-600' },
  open: { label: 'Abierta', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'En progreso', color: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Completada', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-700' }
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[--tribu-blue]"></div>
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
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[--tribu-navy]">
            Mis Actividades
          </h1>
          <p className="text-[--tribu-gray] mt-2">
            Gestiona tu voluntariado
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm">
            <div className="text-2xl lg:text-3xl font-bold text-[--tribu-blue]">{activities.length}</div>
            <div className="text-sm text-[--tribu-gray]">Total registradas</div>
          </div>
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm">
            <div className="text-2xl lg:text-3xl font-bold text-[--tribu-green]">{upcomingActivities.length}</div>
            <div className="text-sm text-[--tribu-gray]">Próximas</div>
          </div>
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm">
            <div className="text-2xl lg:text-3xl font-bold text-gray-600">{pastActivities.length}</div>
            <div className="text-sm text-[--tribu-gray]">Completadas</div>
          </div>
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm">
            <div className="text-2xl lg:text-3xl font-bold text-[--tribu-orange]">
              {activities.filter(a => a.status === 'registered').length}
            </div>
            <div className="text-sm text-[--tribu-gray]">Pendientes</div>
          </div>
        </div>

        {/* Upcoming Activities */}
        {upcomingActivities.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[--tribu-navy] mb-4 flex items-center">
              <span className="mr-2">📅</span> Próximas Actividades
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {upcomingActivities.map((reg) => (
                <div key={reg.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all">
                  <div className={`${
                    reg.status === 'registered' 
                      ? 'bg-gradient-to-r from-[--tribu-blue] to-blue-600' 
                      : 'bg-gradient-to-r from-green-500 to-green-600'
                  } text-white px-4 py-2`}>
                    <span className="font-medium">{statusLabels[reg.status]?.label}</span>
                  </div>
                  
                  <div className="p-4 lg:p-5">
                    <div className="flex items-center mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        🏢 {(reg.activity as any)?.organization_name || 'ONG'}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-[--tribu-navy] mb-2 line-clamp-2">
                      {reg.activity?.title}
                    </h3>
                    
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-start text-[--tribu-gray]">
                        <span className="w-5 flex-shrink-0">📅</span>
                        <div>
                          <p className="font-medium">{formatDate(reg.activity?.start_time || '')}</p>
                          <p className="text-xs text-gray-500">
                            {reg.activity?.start_time && reg.activity?.end_time 
                              ? `${getHours(reg.activity.start_time, reg.activity.end_time)} horas`
                              : ''}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start text-[--tribu-gray]">
                        <span className="w-5 flex-shrink-0">📍</span>
                        <span className="line-clamp-1">{reg.activity?.location || 'Sin ubicación'}</span>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="mb-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        activityStatusLabels[reg.activity?.status || 'draft']?.color
                      }`}>
                        {activityStatusLabels[reg.activity?.status || 'draft']?.label}
                      </span>
                    </div>
                    
                    {/* Action - Show scan button when activity is completed */}
                    {reg.activity?.status === 'completed' && reg.status === 'registered' && (
                      <Link 
                        href="/scan"
                        className="block w-full py-3 bg-[--tribu-green] text-white text-center rounded-lg font-semibold hover:bg-green-600 transition-colors"
                      >
                        📷 Escanear QR para acreditar horas
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
            <h2 className="text-xl font-bold text-[--tribu-navy] mb-4 flex items-center">
              <span className="mr-2">✅</span> Actividades Completadas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {pastActivities.map((reg) => (
                <div key={reg.id} className="bg-white rounded-xl shadow-sm overflow-hidden opacity-80">
                  <div className="bg-gray-100 text-gray-600 px-4 py-2">
                    <span className="font-medium">{statusLabels[reg.status]?.label}</span>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        🏢 {(reg.activity as any)?.organization_name || 'ONG'}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-700 mb-2">
                      {reg.activity?.title}
                    </h3>
                    
                    <div className="text-sm text-gray-500">
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
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-xl font-bold text-[--tribu-navy]">Aún no tienes actividades</h3>
            <p className="text-[--tribu-gray] mt-2 mb-6">
              Explora el feed para encontrar oportunidades de voluntariado
            </p>
            <Link 
              href="/feed"
              className="inline-block px-6 py-3 bg-[--tribu-blue] text-white rounded-lg font-semibold hover:bg-[--tribu-navy] transition-colors"
            >
              Explorar Actividades →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
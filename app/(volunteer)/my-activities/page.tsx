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

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-bold text-[--tribu-navy]">Mis Actividades</h1>

      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((reg) => (
            <div key={reg.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-[--tribu-navy] flex-1">
                    {reg.activity?.title}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusLabels[reg.status]?.color}`}>
                    {statusLabels[reg.status]?.label}
                  </span>
                </div>
                
                <p className="text-sm text-[--tribu-gray] mb-3">
                  {(reg.activity as any)?.organization_name || 'ONG'}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-[--tribu-gray]">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(reg.activity?.start_time || '')}
                  </div>
                  
                  <div className="flex items-center text-[--tribu-gray]">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {reg.activity?.location}
                  </div>

                  <div className="flex items-center text-[--tribu-gray]">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {reg.activity?.start_time && reg.activity?.end_time 
                      ? `${getHours(reg.activity.start_time, reg.activity.end_time)} horas`
                      : ''}
                  </div>
                </div>

                {/* Estado de la actividad */}
                <div className="mt-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activityStatusLabels[reg.activity?.status || 'draft']?.color
                  }`}>
                    {activityStatusLabels[reg.activity?.status || 'draft']?.label}
                  </span>
                </div>

                {/* Botón de escanear si está en progreso */}
                {reg.activity?.status === 'in_progress' && reg.status === 'registered' && (
                  <Link 
                    href="/scan"
                    className="mt-4 block w-full py-2.5 bg-[--tribu-green] text-white text-center rounded-lg font-medium hover:bg-[--tribu-navy] transition-colors"
                  >
                    Escuchar QR para registrar asistencia
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No tienes actividades</h3>
          <p className="mt-2 text-sm text-gray-500">
            Explora el feed para encontrar actividades disponibles
          </p>
          <Link 
            href="/feed"
            className="mt-4 inline-block text-[--tribu-blue] hover:underline"
          >
            Ver actividades →
          </Link>
        </div>
      )}
    </div>
  );
}
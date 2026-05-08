// app/(org)/dashboard/page.tsx
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Activity {
  id: string;
  title: string;
  status: string;
  start_time: string;
  end_time: string;
  location?: string;
  registeredCount: number;
}

interface Volunteer {
  id: string;
  full_name: string;
  total_hours: number;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState<string>('');
  const [stats, setStats] = useState({
    totalActivities: 0,
    totalVolunteers: 0,
    totalHours: 0,
    attendanceRate: 0
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [topVolunteers, setTopVolunteers] = useState<Volunteer[]>([]);
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    const supabase = createClient();
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }

      // Get org_id and org name
      const { data: orgMember } = await supabase
        .from('org_members')
        .select('org_id, organizations(name)')
        .eq('user_id', session.user.id)
        .single();
      
      if (!orgMember) {
        setLoading(false);
        return;
      }

      setOrgId(orgMember.org_id);

      // Get organization name separately with a proper join query
      const { data: orgData } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', orgMember.org_id)
        .single();
      
      setOrgName(orgData?.name || 'Mi Organización');

      // 1. Get all activities for this org
      const { data: activities } = await supabase
        .from('activities')
        .select('id, title, status, start_time, end_time, location')
        .eq('org_id', orgMember.org_id)
        .order('created_at', { ascending: false });

      const activityIds = activities?.map(a => a.id) || [];
      const totalActivities = activities?.length || 0;

      let totalVolunteers = 0;
      let totalHours = 0;
      let attendedCount = 0;

      // 2. Get registration counts per activity
      const registrationCounts = new Map<string, number>();
      
      if (activityIds.length > 0) {
        // Get all registrations for these activities
        const { data: registrations } = await supabase
          .from('activity_registrations')
          .select('activity_id, volunteer_id, status')
          .in('activity_id', activityIds);

        // Count unique volunteers (status !== 'cancelled')
        const uniqueVolunteers = new Set<string>();
        for (const reg of (registrations || []) as any[]) {
          if (reg.status !== 'cancelled') {
            uniqueVolunteers.add(reg.volunteer_id);
            
            // Count per activity
            const count = (registrationCounts.get(reg.activity_id) || 0);
            registrationCounts.set(reg.activity_id, count + 1);
          }
        }
        totalVolunteers = uniqueVolunteers.size;

        // Get attendance logs for hours
        const { data: attendanceLogs } = await supabase
          .from('attendance_logs')
          .select('hours_credited')
          .in('activity_id', activityIds);

        for (const log of attendanceLogs || []) {
          if (log.hours_credited) {
            totalHours += parseFloat(log.hours_credited);
            attendedCount++;
          }
        }
      }

      // Calculate attendance rate
      const attendanceRate = totalVolunteers > 0 && attendedCount > 0 
        ? Math.round((attendedCount / totalVolunteers) * 100)
        : 0;

      setStats({
        totalActivities,
        totalVolunteers,
        totalHours,
        attendanceRate
      });

      // 3. Format recent activities with registration counts
      if (activities && activities.length > 0) {
        setRecentActivities(
          activities.slice(0, 5).map(a => ({
            id: a.id,
            title: a.title,
            status: a.status,
            start_time: a.start_time,
            end_time: a.end_time,
            location: a.location,
            registeredCount: registrationCounts.get(a.id) || 0
          }))
        );
      }

      // 4. Get top volunteers (those with most hours in org activities)
      if (activityIds.length > 0) {
        const { data: allAttendanceLogs } = await supabase
          .from('attendance_logs')
          .select('volunteer_id, hours_credited')
          .in('activity_id', activityIds);

        const volunteerHours = new Map<string, number>();
        
        for (const log of allAttendanceLogs || []) {
          const current = volunteerHours.get(log.volunteer_id) || 0;
          volunteerHours.set(log.volunteer_id, current + (parseFloat(log.hours_credited) || 0));
        }

        // Get top 3 volunteers by hours
        const sortedVolunteers = Array.from(volunteerHours.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3);

        // Get their profiles
        const topVolunteersData: Volunteer[] = [];
        for (const [volId, hours] of sortedVolunteers) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('full_name')
            .eq('id', volId)
            .single();

          topVolunteersData.push({
            id: volId,
            full_name: profile?.full_name || 'Voluntario',
            total_hours: hours
          });
        }

        setTopVolunteers(topVolunteersData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-DO', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[--tribu-blue]"></div>
      </div>
    );
  }

  // If no org found
  if (!orgId) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-center max-w-md">
          <svg className="mx-auto h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No tienes una organización</h3>
          <p className="mt-2 text-sm text-gray-500">
            Contáctate con el administrador para crear una organización.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[--tribu-navy]">Dashboard - {orgName}</h1>
        <p className="text-[--tribu-gray]">Aquí tienes un resumen de tu impacto social</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-[--tribu-gray]">Actividades</h3>
          <p className="text-3xl font-bold text-[--tribu-navy] mt-2">{stats.totalActivities}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-[--tribu-gray]">Voluntarios</h3>
          <p className="text-3xl font-bold text-[--tribu-navy] mt-2">{stats.totalVolunteers}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-[--tribu-gray]">Horas generadas</h3>
          <p className="text-3xl font-bold text-[--tribu-navy] mt-2">{stats.totalHours}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-[--tribu-gray]">Tasa de asistencia</h3>
          <p className="text-3xl font-bold text-[--tribu-navy] mt-2">{stats.attendanceRate}%</p>
        </div>
      </div>

      {/* Recent activities and top volunteers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-[--tribu-navy]">Actividades recientes</h2>
            <Link href="/activities" className="text-sm text-[--tribu-blue] hover:underline">
              Ver todas
            </Link>
          </div>
          
          {recentActivities.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay actividades aún</p>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <Link 
                  key={activity.id} 
                  href={`/activities/${activity.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-[--tribu-blue] transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-[--tribu-navy]">{activity.title}</h3>
                      <p className="text-sm text-[--tribu-gray] mt-1">
                        {formatDate(activity.start_time)}
                        {activity.location && ` • ${activity.location}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status === 'open' ? 'Abierta' : 
                         activity.status === 'in_progress' ? 'En progreso' :
                         activity.status === 'completed' ? 'Completada' :
                         activity.status === 'draft' ? 'Borrador' : activity.status}
                      </span>
                      <p className="text-xs text-[--tribu-gray] mt-1">
                        {activity.registeredCount} registrados
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <Link 
            href="/activities/new"
            className="mt-4 w-full flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-[--tribu-blue] hover:text-[--tribu-blue] transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crear nueva actividad
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-[--tribu-navy]">Top voluntarios</h2>
            <Link href="/volunteers" className="text-sm text-[--tribu-blue] hover:underline">
              Ver todos
            </Link>
          </div>
          
          {topVolunteers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Los voluntarios que participen en tus actividades aparecerán aquí
            </p>
          ) : (
            <div className="space-y-4">
              {topVolunteers.map((volunteer, index) => (
                <div key={volunteer.id} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="font-medium text-[--tribu-navy]">{volunteer.full_name}</p>
                    <p className="text-sm text-[--tribu-gray]">{volunteer.total_hours} horas</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
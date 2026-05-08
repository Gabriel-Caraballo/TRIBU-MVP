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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white rounded-xl shadow-lg p-8">
          <div className="text-6xl mb-4">🏢</div>
          <h3 className="text-xl font-bold text-[--tribu-navy]">No tienes una organización</h3>
          <p className="text-[--tribu-gray] mt-2 mb-6">
            Contáctate con el administrador para crear una organización.
          </p>
        </div>
      </div>
    );
  }

return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[--tribu-navy]">
            👋 Hola, {orgName}
          </h1>
          <p className="text-[--tribu-gray] mt-2">
            Aquí tienes un resumen de tu impacto social
          </p>
        </div>

        {/* Stats Cards - Responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-[--tribu-blue]">{stats.totalActivities}</div>
                <div className="text-sm text-[--tribu-gray]">Actividades</div>
              </div>
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-100 rounded-xl flex items-center justify-center text-2xl lg:text-3xl">
                📋
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-[--tribu-green]">{stats.totalVolunteers}</div>
                <div className="text-sm text-[--tribu-gray]">Voluntarios</div>
              </div>
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-green-100 rounded-xl flex items-center justify-center text-2xl lg:text-3xl">
                🤝
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-[--tribu-navy]">{stats.totalHours}</div>
                <div className="text-sm text-[--tribu-gray]">Horas</div>
              </div>
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-navy-100 rounded-xl flex items-center justify-center text-2xl lg:text-3xl">
                ⏱️
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-[--tribu-orange]">{stats.attendanceRate}%</div>
                <div className="text-sm text-[--tribu-gray]">Asistencia</div>
              </div>
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-orange-100 rounded-xl flex items-center justify-center text-2xl lg:text-3xl">
                📊
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg lg:text-xl font-bold text-[--tribu-navy] flex items-center">
                <span className="mr-2">📋</span> Actividades Recientes
              </h2>
              <Link href="/activities" className="text-sm text-[--tribu-blue] hover:underline">
                Ver todas →
              </Link>
            </div>
            
            {recentActivities.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📭</div>
                <p className="text-gray-500">No hay actividades aún</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <Link 
                    key={activity.id} 
                    href={`/activities/${activity.id}`}
                    className="block p-3 lg:p-4 border border-gray-100 rounded-lg hover:border-[--tribu-blue] hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[--tribu-navy] truncate">{activity.title}</h3>
                        <p className="text-sm text-[--tribu-gray] mt-1">
                          {formatDate(activity.start_time)}
                          {activity.location && ` • ${activity.location}`}
                        </p>
                      </div>
                      <div className="text-right ml-3 flex-shrink-0">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                          {activity.status === 'open' ? '🟢 Abierta' : 
                           activity.status === 'in_progress' ? '🟡 En progreso' :
                           activity.status === 'completed' ? '✅ Completada' :
                           activity.status === 'draft' ? '📝 Borrador' : activity.status}
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
              className="mt-4 w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:border-[--tribu-blue] hover:text-[--tribu-blue] transition-colors font-medium"
            >
              <span className="mr-2 text-lg">➕</span>
              Crear nueva actividad
            </Link>
          </div>

          {/* Top Volunteers */}
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg lg:text-xl font-bold text-[--tribu-navy] flex items-center">
                <span className="mr-2">🏆</span> Top Voluntarios
              </h2>
              <Link href="/volunteers" className="text-sm text-[--tribu-blue] hover:underline">
                Ver todos →
              </Link>
            </div>
            
            {topVolunteers.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🤔</div>
                <p className="text-gray-500">
                  Los voluntarios que participen aparecerán aquí
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {topVolunteers.map((volunteer, index) => (
                  <div key={volunteer.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                    }`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="font-semibold text-[--tribu-navy]">{volunteer.full_name}</p>
                      <p className="text-sm text-[--tribu-gray]">{volunteer.total_hours} horas acumuladas</p>
                    </div>
                    <div className="text-2xl text-gray-300">
                      👏
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
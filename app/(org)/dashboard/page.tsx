// app/(org)/dashboard/page.tsx
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';

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
  
  // Chart data
  const [activitiesChartData, setActivitiesChartData] = useState<{ month: string; count: number }[]>([]);
  const [volunteersBySkill, setVolunteersBySkill] = useState<{ name: string; value: number }[]>([]);

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

      // 5. Prepare activities by month chart data
      if (activities && activities.length > 0) {
        const monthlyData: Record<string, number> = {};
        
        activities.forEach(a => {
          const date = new Date(a.start_time);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
        });

        const sortedMonths = Object.keys(monthlyData).sort();
        const chartData = sortedMonths.slice(-6).map(month => {
          const [year, m] = month.split('-');
          const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
          return {
            month: monthNames[parseInt(m) - 1],
            count: monthlyData[month]
          };
        });
        
        setActivitiesChartData(chartData);
      }

      // 6. Get volunteers by skill for pie chart
      if (activityIds.length > 0) {
        const { data: allRegistrations } = await supabase
          .from('activity_registrations')
          .select('volunteer_id')
          .in('activity_id', activityIds);

        const volunteerIds = Array.from(new Set((allRegistrations || []).map(r => r.volunteer_id)));
        
        if (volunteerIds.length > 0) {
          const { data: profiles } = await supabase
            .from('volunteer_profiles')
            .select('skills')
            .in('user_id', volunteerIds);

          const skillCount: Record<string, number> = {};
          profiles?.forEach(p => {
            (p.skills || []).forEach((skill: string) => {
              skillCount[skill] = (skillCount[skill] || 0) + 1;
            });
          });

          const topSkills = Object.entries(skillCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, value]) => ({ name, value }));

          setVolunteersBySkill(topSkills);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-[#161616] text-[#555] border border-[#1f1f1f]';
      case 'open': return 'bg-[rgba(34,197,94,0.1)] text-[#22c55e] border border-[rgba(34,197,94,0.2)]';
      case 'in_progress': return 'bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border border-[rgba(245,158,11,0.2)]';
      case 'completed': return 'bg-[rgba(34,197,94,0.08)] text-[#22c55e] border border-[rgba(34,197,94,0.15)]';
      case 'cancelled': return 'bg-[rgba(239,68,68,0.08)] text-red-400 border border-[rgba(239,68,68,0.15)]';
      default: return 'bg-[#161616] text-[#555] border border-[#1f1f1f]';
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
      <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#22c55e]"></div>
      </div>
    );
  }

  // If no org found
  if (!orgId) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-[#111] rounded-xl border border-[#1f1f1f] p-8">
          <h3 className="text-xl font-bold text-white">No tienes una organización</h3>
          <p className="text-[#555] mt-2 mb-6">
            Contáctate con el administrador para crear una organización.
          </p>
        </div>
      </div>
    );
  }

return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            Hola, {orgName}
          </h1>
          <p className="text-[#555] mt-2">
            Aquí tienes un resumen de tu impacto social
          </p>
        </div>

        {/* Stats Cards - Responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <div className="bg-[#111] rounded-xl border border-[#1f1f1f] hover:border-[#2a2a2a] p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-[#22c55e]">{stats.totalActivities}</div>
                <div className="text-xs text-[#555] tracking-widest uppercase">Actividades</div>
              </div>
              <svg className="w-8 h-8 text-[#22c55e] opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          
          <div className="bg-[#111] rounded-xl border border-[#1f1f1f] hover:border-[#2a2a2a] p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-[#22c55e]">{stats.totalVolunteers}</div>
                <div className="text-xs text-[#555] tracking-widest uppercase">Voluntarios</div>
              </div>
              <svg className="w-8 h-8 text-[#22c55e] opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          
          <div className="bg-[#111] rounded-xl border border-[#1f1f1f] hover:border-[#2a2a2a] p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-white">{stats.totalHours}</div>
                <div className="text-xs text-[#555] tracking-widest uppercase">Horas</div>
              </div>
              <svg className="w-8 h-8 text-[#22c55e] opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <div className="bg-[#111] rounded-xl border border-[#1f1f1f] hover:border-[#2a2a2a] p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-[#f59e0b]">{stats.attendanceRate}%</div>
                <div className="text-xs text-[#555] tracking-widest uppercase">Asistencia</div>
              </div>
              <svg className="w-8 h-8 text-[#22c55e] opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activities by Month - Bar Chart */}
          <div className="bg-[#111] rounded-xl border border-[#1f1f1f] p-4 lg:p-6">
            <h2 className="text-lg lg:text-xl font-medium text-white mb-4">
              Actividades por Mes
            </h2>
            {activitiesChartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activitiesChartData}>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#555' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#555' }} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: 8, background: '#111', border: '1px solid #1f1f1f', color: '#fff' }}
                      formatter={(value: any) => [`${value} actividades`, '']}
                    />
                    <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-[#444]">
                <p>No hay suficientes datos para mostrar</p>
              </div>
            )}
          </div>

          {/* Volunteers by Skill - Pie Chart */}
          <div className="bg-[#111] rounded-xl border border-[#1f1f1f] p-4 lg:p-6">
            <h2 className="text-lg lg:text-xl font-medium text-white mb-4">
              Voluntarios por Habilidad
            </h2>
            {volunteersBySkill.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={volunteersBySkill}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {volunteersBySkill.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#22c55e', '#16a34a', '#333', '#1f1f1f', '#2a2a2a'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: 8, background: '#111', border: '1px solid #1f1f1f', color: '#fff' }}
                      formatter={(value: any) => [`${value} voluntarios`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-[#444]">
                <p>No hay suficientes datos para mostrar</p>
              </div>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Recent Activities */}
          <div className="bg-[#111] rounded-xl border border-[#1f1f1f] p-4 lg:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg lg:text-xl font-medium text-white">
                Actividades Recientes
              </h2>
              <Link href="/activities" className="text-sm text-[#22c55e] hover:underline">
                Ver todas →
              </Link>
            </div>
            
            {recentActivities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#444]">No hay actividades aún</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <Link 
                    key={activity.id} 
                    href={`/activities/${activity.id}`}
                    className="block p-3 lg:p-4 border border-[#1f1f1f] rounded-lg hover:border-[#2a2a2a] bg-[#0d0d0d] transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">{activity.title}</h3>
                        <p className="text-sm text-[#555] mt-1">
                          {formatDate(activity.start_time)}
                          {activity.location && ` • ${activity.location}`}
                        </p>
                      </div>
                      <div className="text-right ml-3 flex-shrink-0">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                          {activity.status === 'open' ? 'Abierta' : 
                           activity.status === 'in_progress' ? 'En progreso' :
                           activity.status === 'completed' ? 'Completada' :
                           activity.status === 'draft' ? 'Borrador' : activity.status}
                        </span>
                        <p className="text-xs text-[#444] mt-1">
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
              className="mt-4 w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-[#1f1f1f] rounded-lg text-[#333] hover:border-[#22c55e] hover:text-[#22c55e] transition-colors font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              Crear nueva actividad
            </Link>
          </div>

          {/* Top Volunteers */}
          <div className="bg-[#111] rounded-xl border border-[#1f1f1f] p-4 lg:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg lg:text-xl font-medium text-white">
                Top Voluntarios
              </h2>
              <Link href="/volunteers" className="text-sm text-[#22c55e] hover:underline">
                Ver todos →
              </Link>
            </div>
            
            {topVolunteers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#444]">
                  Los voluntarios que participen aparecerán aquí
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {topVolunteers.map((volunteer, index) => (
                  <div key={volunteer.id} className="flex items-center p-3 bg-[#0d0d0d] rounded-lg border border-[#1f1f1f]">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-[#22c55e] text-black' : index === 1 ? 'bg-[#333] text-[#aaa]' : 'bg-[#222] text-[#555]'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-white">{volunteer.full_name}</p>
                      <p className="text-sm text-[#555]">{volunteer.total_hours} horas acumuladas</p>
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
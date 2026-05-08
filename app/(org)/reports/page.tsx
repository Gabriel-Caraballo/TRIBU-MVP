// app/(org)/reports/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface MonthlyStats {
  month: string;
  activities: number;
  volunteers: number;
  hours: number;
}

interface OverallStats {
  totalActivities: number;
  totalVolunteers: number;
  totalHours: number;
  avgVolunteersPerActivity: number;
}

export default function ReportsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get org_id
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

      // Get all activities for this org
      const { data: activities, error: actsError } = await supabase
        .from('activities')
        .select('id, title, start_time, status')
        .eq('org_id', orgMember.org_id)
        .order('start_time', { ascending: false });

      if (actsError) throw actsError;

      if (!activities || activities.length === 0) {
        setMonthlyStats([]);
        setOverallStats({
          totalActivities: 0,
          totalVolunteers: 0,
          totalHours: 0,
          avgVolunteersPerActivity: 0
        });
        setLoading(false);
        return;
      }

      const activityIds = activities.map(a => a.id);

      // Get registrations
      const { data: registrations } = await supabase
        .from('activity_registrations')
        .select('activity_id, volunteer_id, status')
        .in('activity_id', activityIds);

      // Get attendance logs
      const { data: attendanceLogs } = await supabase
        .from('attendance_logs')
        .select('activity_id, volunteer_id, hours_credited, scanned_at')
        .in('activity_id', activityIds);

      // Calculate monthly stats
      const monthlyMap = new Map<string, MonthlyStats>();
      const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

      for (const activity of activities) {
        if (!activity.start_time) continue;
        
        const date = new Date(activity.start_time);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        const monthName = monthNames[date.getMonth()];
        
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, {
            month: `${monthName} ${date.getFullYear()}`,
            activities: 0,
            volunteers: 0,
            hours: 0
          });
        }
        
        const monthData = monthlyMap.get(monthKey)!;
        if (activity.status === 'completed' || activity.status === 'in_progress') {
          monthData.activities += 1;
        }
      }

      // Count unique volunteers per month
      const volunteerMonths = new Map<string, Set<string>>();
      for (const reg of registrations || []) {
        const activity = activities.find(a => a.id === reg.activity_id);
        if (!activity?.start_time) continue;
        
        const date = new Date(activity.start_time);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        
        if (!volunteerMonths.has(monthKey)) {
          volunteerMonths.set(monthKey, new Set());
        }
        
        if (reg.status === 'attended') {
          volunteerMonths.get(monthKey)!.add(reg.volunteer_id);
        }
      }

      // Add volunteer counts
      Array.from(volunteerMonths.entries()).forEach(([monthKey, volSet]) => {
        const monthData = monthlyMap.get(monthKey);
        if (monthData) {
          monthData.volunteers = volSet.size;
        }
      });

      // Sum hours per month
      for (const log of attendanceLogs || []) {
        const activity = activities.find(a => a.id === log.activity_id);
        if (!activity?.start_time) continue;
        
        const date = new Date(activity.start_time);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        
        const monthData = monthlyMap.get(monthKey);
        if (monthData && log.hours_credited) {
          monthData.hours += parseFloat(log.hours_credited);
        }
      }

      // Calculate overall stats
      const uniqueVolunteers = new Set<string>();
      for (const reg of registrations || []) {
        if (reg.status === 'attended') {
          uniqueVolunteers.add(reg.volunteer_id);
        }
      }

      const totalHours = attendanceLogs?.reduce((sum, log) => 
        sum + (parseFloat(log.hours_credited) || 0), 0
      ) || 0;

      setMonthlyStats(Array.from(monthlyMap.values()).reverse());
      setOverallStats({
        totalActivities: activities.length,
        totalVolunteers: uniqueVolunteers.size,
        totalHours: totalHours,
        avgVolunteersPerActivity: activities.length > 0 
          ? Math.round((uniqueVolunteers.size / activities.length) * 10) / 10 
          : 0
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[--tribu-blue]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[--tribu-navy]">Reportes</h1>
        <p className="text-[--tribu-gray]">Impacto social de tu organización</p>
      </div>

      {/* Overall Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-[--tribu-gray]">Total Actividades</h3>
          <p className="text-3xl font-bold text-[--tribu-navy] mt-2">
            {overallStats?.totalActivities || 0}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-[--tribu-gray]">Total Voluntarios</h3>
          <p className="text-3xl font-bold text-[--tribu-navy] mt-2">
            {overallStats?.totalVolunteers || 0}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-[--tribu-gray]">Horas Totales</h3>
          <p className="text-3xl font-bold text-[--tribu-navy] mt-2">
            {overallStats?.totalHours || 0}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-[--tribu-gray]">Promedio Voluntarios</h3>
          <p className="text-3xl font-bold text-[--tribu-navy] mt-2">
            {overallStats?.avgVolunteersPerActivity || 0}
          </p>
        </div>
      </div>

      {/* Monthly Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[--tribu-navy]">Estadísticas Mensuales</h2>
        </div>
        
        {monthlyStats.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="mt-4 text-gray-500">No hay datos suficientes aún</p>
            <p className="mt-2 text-sm text-gray-400">Crea actividades para comenzar a generar impacto</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mes
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actividades
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Voluntarios
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horas
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthlyStats.map((stat, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stat.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {stat.activities}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {stat.volunteers}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      <span className="font-medium text-[--tribu-green]">{stat.hours}h</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Impact Summary */}
      <div className="bg-gradient-to-r from-[--tribu-blue] to-[--tribu-navy] rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-xl font-bold mb-4">Resumen de Impacto</h2>
        <p className="text-lg">
          Tu organización ha generado <span className="font-bold">{overallStats?.totalHours || 0} horas</span> de voluntariado 
          con la participación de <span className="font-bold">{overallStats?.totalVolunteers || 0} voluntarios</span> en 
          <span className="font-bold">{overallStats?.totalActivities || 0} actividades</span>.
        </p>
        <p className="mt-2 text-blue-100">
          ¡Gracias por generar impacto positivo en tu comunidad!
        </p>
      </div>
    </div>
  );
}
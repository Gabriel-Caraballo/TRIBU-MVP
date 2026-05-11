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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#22c55e]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Reportes</h1>
        <p className="text-[#555]">Impacto social de tu organización</p>
      </div>

      {/* Overall Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111] p-6 rounded-lg border border-[#1f1f1f]">
          <h3 className="text-xs font-medium text-[#444] tracking-widest uppercase">Total Actividades</h3>
          <p className="text-3xl font-bold text-white mt-2">
            {overallStats?.totalActivities || 0}
          </p>
        </div>
        
        <div className="bg-[#111] p-6 rounded-lg border border-[#1f1f1f]">
          <h3 className="text-xs font-medium text-[#444] tracking-widest uppercase">Total Voluntarios</h3>
          <p className="text-3xl font-bold text-white mt-2">
            {overallStats?.totalVolunteers || 0}
          </p>
        </div>
        
        <div className="bg-[#111] p-6 rounded-lg border border-[#1f1f1f]">
          <h3 className="text-xs font-medium text-[#444] tracking-widest uppercase">Horas Totales</h3>
          <p className="text-3xl font-bold text-white mt-2">
            {overallStats?.totalHours || 0}
          </p>
        </div>
        
        <div className="bg-[#111] p-6 rounded-lg border border-[#1f1f1f]">
          <h3 className="text-xs font-medium text-[#444] tracking-widest uppercase">Promedio Voluntarios</h3>
          <p className="text-3xl font-bold text-white mt-2">
            {overallStats?.avgVolunteersPerActivity || 0}
          </p>
        </div>
      </div>

      {/* Monthly Table */}
      <div className="bg-[#111] rounded-lg border border-[#1f1f1f] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1f1f1f]">
          <h2 className="text-lg font-medium text-white">Estadísticas Mensuales</h2>
        </div>
        
        {monthlyStats.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="mt-4 text-[#555]">No hay datos suficientes aún</p>
            <p className="mt-2 text-sm text-[#333]">Crea actividades para comenzar a generar impacto</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#1f1f1f]">
              <thead className="bg-[#0d0d0d]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#444]">
                    Mes
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[#444]">
                    Actividades
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[#444]">
                    Voluntarios
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[#444]">
                    Horas
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f]">
                {monthlyStats.map((stat, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-[#111]' : 'bg-[#0d0d0d]'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {stat.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-[#555]">
                      {stat.activities}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-[#555]">
                      {stat.volunteers}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-[#555]">
                      <span className="font-medium text-[#22c55e]">{stat.hours}h</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Impact Summary */}
      <div className="bg-[#111] border border-[#22c55e] border-opacity-20 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Resumen de Impacto</h2>
        <p className="text-lg text-[#aaa]">
          Tu organización ha generado <span className="font-bold text-white">{overallStats?.totalHours || 0} horas</span> de voluntariado 
          con la participación de <span className="font-bold text-white">{overallStats?.totalVolunteers || 0} voluntarios</span> en 
          <span className="font-bold text-white">{overallStats?.totalActivities || 0} actividades</span>.
        </p>
        <p className="mt-2 text-[#555]">
          El impacto de tu organización es real y medible.
        </p>
      </div>
    </div>
  );
}
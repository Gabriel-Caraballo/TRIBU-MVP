"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

// --- Interfaces ---
interface DashboardData {
  userName: string;
  totalHours: number;
  activityCount: number;
  certificateCount: number;
  level: string;
  levelProgress: number;
  nextLevelHours: number;
  upcomingActivities: Array<{
    id: string;
    title: string;
    start_time: string;
    location: string;
    status: string;
    registrationStatus: string;
  }>;
  skillHours: Array<{ skill: string; hours: number }>;
  recentHours: number;
}

// --- Helpers de Lógica ---
const LEVELS = [
  { name: 'Pino', min: 0, next: 10 },
  { name: 'Activo', min: 10, next: 150 },
  { name: 'Experto', min: 150, next: null }
];

function getUserLevelData(hours: number) {
  if (hours >= 150) return { name: 'Experto', progress: 100, next: 0 };
  if (hours >= 10) return {
    name: 'Activo',
    progress: Math.min(100, Math.round(((hours - 10) / 140) * 100)),
    next: 150 - hours
  };
  return {
    name: 'Pino',
    progress: Math.min(100, Math.round((hours / 10) * 100)),
    next: 10 - hours
  };
}

const formatDate = (dateString: string) =>
  new Intl.DateTimeFormat('es-DO', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  }).format(new Date(dateString));

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buen día';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
};

// --- Componente Principal ---
export default function VolunteerDashboard() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const userId = session.user.id;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      // Ejecución paralela para optimizar velocidad
      const [
        profileRes,
        volunteerRes,
        registrationsRes,
        activityCountRes,
        certsCountRes,
        logsRes
      ] = await Promise.all([
        supabase.from('user_profiles').select('full_name').eq('id', userId).single(),
        supabase.from('volunteer_profiles').select('total_hours').eq('user_id', userId).maybeSingle(),
        supabase.from('activity_registrations').select('activity_id, status').eq('volunteer_id', userId).in('status', ['registered', 'pending', 'approved']),
        supabase.from('activity_registrations').select('*', { count: 'exact', head: true }).eq('volunteer_id', userId),
        supabase.from('certificates').select('*', { count: 'exact', head: true }).eq('volunteer_id', userId).eq('status', 'issued'),
        supabase.from('attendance_logs').select('skill, hours_credited, scanned_at').eq('volunteer_id', userId)
      ]);

      const totalHours = volunteerRes.data?.total_hours || 0;
      const { name, progress, next } = getUserLevelData(totalHours);

      // Procesar Actividades Próximas
      let upcomingActivities: any[] = [];
      const registeredIds = registrationsRes.data?.map(r => r.activity_id) || [];

      if (registeredIds.length > 0) {
        const { data: actData } = await supabase
          .from('activities')
          .select('id, title, start_time, location, status')
          .in('id', registeredIds)
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(3);

        upcomingActivities = actData?.map(a => ({
          ...a,
          location: a.location || 'Sin ubicación',
          registrationStatus: registrationsRes.data?.find(r => r.activity_id === a.id)?.status || 'pending'
        })) || [];
      }

      // Procesar Horas y Habilidades
      const hoursMap: Record<string, number> = {};
      let recentHours = 0;
      const isoWeekAgo = weekAgo.toISOString();

      logsRes.data?.forEach(log => {
        const h = Number(log.hours_credited) || 0;
        if (log.skill) hoursMap[log.skill] = (hoursMap[log.skill] || 0) + h;
        if (log.scanned_at >= isoWeekAgo) recentHours += h;
      });

      const skillHours = Object.entries(hoursMap)
        .map(([skill, hours]) => ({ skill, hours: Math.round(hours * 10) / 10 }))
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 4);

      setData({
        userName: profileRes.data?.full_name?.split(' ')[0] || 'Voluntario',
        totalHours,
        activityCount: activityCountRes.count || 0,
        certificateCount: certsCountRes.count || 0,
        level: name,
        levelProgress: progress,
        nextLevelHours: next,
        upcomingActivities,
        skillHours,
        recentHours: Math.round(recentHours * 10) / 10,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#22c55e]"></div>
      </div>
    );
  }

  const maxSkillHours = data.skillHours[0]?.hours || 1;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">{getGreeting()}, {data.userName}</h1>
            <p className="text-[#555] text-sm mt-1">
              {data.upcomingActivities.length > 0
                ? `Tienes ${data.upcomingActivities.length} actividad${data.upcomingActivities.length > 1 ? 'es' : ''} próxima${data.upcomingActivities.length > 1 ? 's' : ''}`
                : 'Sin actividades próximas — explora el feed'}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#111] border border-[#1f1f1f] rounded-full px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-[#22c55e]"></div>
            <span className="text-[#22c55e] text-xs font-medium">{data.level}</span>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'HORAS VALIDADAS', value: data.totalHours, sub: data.recentHours > 0 ? `+${data.recentHours}h esta semana` : 'Total acumulado', color: 'text-[#22c55e]' },
            { label: 'ACTIVIDADES', value: data.activityCount, sub: `${data.upcomingActivities.length} próximas` },
            { label: 'CERTIFICADOS', value: data.certificateCount, sub: 'emitidos' }
          ].map((stat, i) => (
            <div key={i} className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4">
              <p className="text-[10px] text-[#444] tracking-widest mb-2">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color || 'text-white'}`}>{stat.value}</p>
              <p className="text-[10px] text-[#333] mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Progreso de nivel */}
        <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-5 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium">Progreso hacia {data.level === 'Experto' ? 'nivel máximo' : 'siguiente nivel'}</span>
            {data.nextLevelHours > 0 && <span className="text-xs text-[#555]">Faltan {data.nextLevelHours}h</span>}
          </div>
          <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden mb-3">
            <div className="h-full bg-[#22c55e] transition-all duration-700" style={{ width: `${data.levelProgress}%` }} />
          </div>
          <div className="flex justify-between">
            {['Pino · 0h', 'Activo · 10h', 'Experto · 150h'].map((label, i) => {
              const isActive = (i === 0) || (i === 1 && data.totalHours >= 10) || (i === 2 && data.totalHours >= 150);
              return <span key={label} className={`text-[10px] ${isActive ? 'text-[#22c55e]' : 'text-[#333]'}`}>{label}</span>
            })}
          </div>
        </div>

        {/* Actividades + Habilidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Actividades */}
          <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] text-[#444] tracking-widest">PRÓXIMAS ACTIVIDADES</p>
              <Link href="/my-activities" className="text-[10px] text-[#22c55e] hover:underline">Ver todas →</Link>
            </div>
            {data.upcomingActivities.length > 0 ? (
              <div className="space-y-3">
                {data.upcomingActivities.map(activity => (
                  <Link href={`/feed/${activity.id}`} key={activity.id} className="flex gap-3 items-start group">
                    <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${['approved', 'registered'].includes(activity.registrationStatus) ? 'bg-[#22c55e]' : 'bg-[#f59e0b]'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#ddd] font-medium group-hover:text-white truncate">{activity.title}</p>
                      <p className="text-[11px] text-[#444] mt-0.5">{formatDate(activity.start_time)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-[#333] text-sm">Sin actividades próximas</p>
                <Link href="/feed" className="text-[#22c55e] text-xs hover:underline mt-1 inline-block">Explorar feed →</Link>
              </div>
            )}
          </div>

          {/* Habilidades */}
          <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-5">
            <p className="text-[10px] text-[#444] tracking-widest mb-4">TOP HABILIDADES</p>
            {data.skillHours.length > 0 ? (
              <div className="space-y-3">
                {data.skillHours.map(({ skill, hours }) => (
                  <div key={skill} className="flex items-center gap-3">
                    <span className="text-xs text-[#aaa] w-24 truncate">{skill}</span>
                    <div className="flex-1 h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div className="h-full bg-[#22c55e]" style={{ width: `${(hours / maxSkillHours) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-[#444] w-8 text-right">{hours}h</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-[#333] text-sm">Sin horas registradas aún</div>
            )}
          </div>
        </div>

        {/* Acciones rápidas */}
        <p className="text-[9px] text-[#333] tracking-[0.14em] mb-3">ACCIONES RÁPIDAS</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { href: '/feed', label: 'Explorar feed', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
            { href: '/scan', label: 'Escanear QR', icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z' },
            { href: '/certificates', label: 'Certificados', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' }
          ].map((action) => (
            <Link key={action.href} href={action.href} className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4 flex flex-col items-center gap-2 hover:border-[#2a2a2a] transition-colors">
              <svg className="w-5 h-5 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={action.icon} />
              </svg>
              <span className="text-[10px] text-[#555] text-center">{action.label}</span>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}

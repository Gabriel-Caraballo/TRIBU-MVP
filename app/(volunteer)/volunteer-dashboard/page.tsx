// app/(volunteer)/volunteer-dashboard/page.tsx
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface DashboardData {
  userName: string;
  totalHours: number;
  activityCount: number;
  certificateCount: number;
  level: string;
  levelProgress: number;
  nextLevelHours: number;
  upcomingActivities: {
    id: string;
    title: string;
    start_time: string;
    location: string;
    status: string;
    registrationStatus: string;
  }[];
  skillHours: {
    skill: string;
    hours: number;
  }[];
  recentHours: number;
}

function getUserLevel(hours: number): { name: string; min: number; max: number } {
  if (hours >= 150) return { name: 'Experto', min: 150, max: 150 };
  if (hours >= 10) return { name: 'Activo', min: 10, max: 149 };
  return { name: 'Rookie', min: 0, max: 9 };
}

function getLevelProgress(hours: number): number {
  if (hours >= 150) return 100;
  if (hours >= 10) return Math.min(100, Math.round(((hours - 10) / 140) * 100));
  return Math.min(100, Math.round((hours / 10) * 100));
}

function getNextLevelHours(hours: number): number {
  if (hours >= 150) return 0;
  if (hours >= 10) return 150 - hours;
  return 10 - hours;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-DO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buen día';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function VolunteerDashboard() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    userName: '',
    totalHours: 0,
    activityCount: 0,
    certificateCount: 0,
    level: 'Rookie',
    levelProgress: 0,
    nextLevelHours: 10,
    upcomingActivities: [],
    skillHours: [],
    recentHours: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Nombre del usuario
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single();

      // Perfil de voluntario
      const { data: volunteerProfile } = await supabase
        .from('volunteer_profiles')
        .select('total_hours, skills')
        .eq('user_id', session.user.id)
        .maybeSingle();

      const totalHours = volunteerProfile?.total_hours || 0;
      const level = getUserLevel(totalHours);
      const progress = getLevelProgress(totalHours);
      const nextHours = getNextLevelHours(totalHours);

      // Actividades próximas registradas
      const { data: registrations } = await supabase
        .from('activity_registrations')
        .select('activity_id, status')
        .eq('volunteer_id', session.user.id)
        .in('status', ['registered', 'pending', 'approved']);

      const activityIds = registrations?.map(r => r.activity_id) || [];

      let upcomingActivities: DashboardData['upcomingActivities'] = [];

      if (activityIds.length > 0) {
        const { data: activitiesData } = await supabase
          .from('activities')
          .select('id, title, start_time, location, status')
          .in('id', activityIds)
          .in('status', ['open', 'in_progress'])
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(3);

        upcomingActivities = (activitiesData || []).map(a => ({
          ...a,
          location: a.location || 'Sin ubicación',
          registrationStatus: registrations?.find(r => r.activity_id === a.id)?.status || 'pending'
        }));
      }

      // Conteo total de actividades
      const { count: activityCount } = await supabase
        .from('activity_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('volunteer_id', session.user.id);

      // Certificados
      const { count: certificateCount } = await supabase
        .from('certificates')
        .select('*', { count: 'exact', head: true })
        .eq('volunteer_id', session.user.id)
        .eq('status', 'issued');

      // Horas por habilidad desde attendance_logs
      const { data: attendanceLogs } = await supabase
        .from('attendance_logs')
        .select('skill, hours_credited')
        .eq('volunteer_id', session.user.id)
        .gt('hours_credited', 0);

      const hoursMap: Record<string, number> = {};
      attendanceLogs?.forEach(log => {
        if (log.skill) {
          hoursMap[log.skill] = (hoursMap[log.skill] || 0) + Number(log.hours_credited);
        }
      });
      const skillHours = Object.entries(hoursMap)
        .map(([skill, hours]) => ({ skill, hours: Math.round(hours * 10) / 10 }))
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 4);

      // Horas recientes (últimos 7 días)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { data: recentLogs } = await supabase
        .from('attendance_logs')
        .select('hours_credited')
        .eq('volunteer_id', session.user.id)
        .gte('scanned_at', weekAgo.toISOString());
      const recentHours = recentLogs?.reduce((sum, l) => sum + Number(l.hours_credited), 0) || 0;

      setData({
        userName: userProfile?.full_name?.split(' ')[0] || 'Voluntario',
        totalHours,
        activityCount: activityCount || 0,
        certificateCount: certificateCount || 0,
        level: level.name,
        levelProgress: progress,
        nextLevelHours: nextHours,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#22c55e]"></div>
      </div>
    );
  }

  const maxSkillHours = data.skillHours[0]?.hours || 1;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {getGreeting()}, {data.userName}
            </h1>
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
          <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4">
            <p className="text-[10px] text-[#444] tracking-widest mb-2">HORAS VALIDADAS</p>
            <p className="text-3xl font-bold text-[#22c55e]">{data.totalHours}</p>
            {data.recentHours > 0 && (
              <p className="text-[10px] text-[#333] mt-1">+{data.recentHours}h esta semana</p>
            )}
          </div>
          <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4">
            <p className="text-[10px] text-[#444] tracking-widest mb-2">ACTIVIDADES</p>
            <p className="text-3xl font-bold text-white">{data.activityCount}</p>
            {data.upcomingActivities.length > 0 && (
              <p className="text-[10px] text-[#333] mt-1">{data.upcomingActivities.length} próximas</p>
            )}
          </div>
          <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4">
            <p className="text-[10px] text-[#444] tracking-widest mb-2">CERTIFICADOS</p>
            <p className="text-3xl font-bold text-white">{data.certificateCount}</p>
            <p className="text-[10px] text-[#333] mt-1">emitidos</p>
          </div>
        </div>

        {/* Barra de progreso de nivel */}
        <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-5 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-white">Progreso hacia {data.level === 'Experto' ? 'nivel máximo' : 'siguiente nivel'}</span>
            {data.nextLevelHours > 0 && (
              <span className="text-xs text-[#555]">Faltan {data.nextLevelHours}h</span>
            )}
          </div>
          <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-[#22c55e] rounded-full transition-all duration-700"
              style={{ width: `${data.levelProgress}%` }}
            />
          </div>
          <div className="flex justify-between">
            {['Rookie · 0h', 'Activo · 10h', 'Experto · 150h'].map((label, i) => (
              <span
                key={label}
                className={`text-[10px] ${
                  (i === 0 && data.totalHours >= 0) ||
                  (i === 1 && data.totalHours >= 10) ||
                  (i === 2 && data.totalHours >= 150)
                    ? 'text-[#22c55e]'
                    : 'text-[#333]'
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Dos columnas: próximas actividades + top habilidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

          {/* Próximas actividades */}
          <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] text-[#444] tracking-widest">PRÓXIMAS ACTIVIDADES</p>
              <Link href="/my-activities" className="text-[10px] text-[#22c55e] hover:underline">
                Ver todas →
              </Link>
            </div>
            {data.upcomingActivities.length > 0 ? (
              <div className="space-y-3">
                {data.upcomingActivities.map(activity => (
                  <Link href={`/feed/${activity.id}`} key={activity.id} className="flex gap-3 items-start group">
                    <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${
                      activity.registrationStatus === 'approved' || activity.registrationStatus === 'registered'
                        ? 'bg-[#22c55e]'
                        : 'bg-[#f59e0b]'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#ddd] font-medium group-hover:text-white truncate">
                        {activity.title}
                      </p>
                      <p className="text-[11px] text-[#444] mt-0.5">
                        {formatDate(activity.start_time)}
                      </p>
                      <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full mt-1 ${
                        activity.registrationStatus === 'approved' || activity.registrationStatus === 'registered'
                          ? 'bg-[rgba(34,197,94,0.1)] text-[#22c55e]'
                          : 'bg-[rgba(245,158,11,0.1)] text-[#f59e0b]'
                      }`}>
                        {activity.registrationStatus === 'approved' || activity.registrationStatus === 'registered'
                          ? 'Confirmado'
                          : 'Pendiente'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-[#333] text-sm">Sin actividades próximas</p>
                <Link href="/feed" className="text-[#22c55e] text-xs hover:underline mt-1 inline-block">
                  Explorar feed →
                </Link>
              </div>
            )}
          </div>

          {/* Top habilidades */}
          <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] text-[#444] tracking-widest">TOP HABILIDADES</p>
              <Link href="/profile" className="text-[10px] text-[#22c55e] hover:underline">
                Ver perfil →
              </Link>
            </div>
            {data.skillHours.length > 0 ? (
              <div className="space-y-3">
                {data.skillHours.map(({ skill, hours }) => (
                  <div key={skill} className="flex items-center gap-3">
                    <span className="text-xs text-[#aaa] w-24 truncate flex-shrink-0">{skill}</span>
                    <div className="flex-1 h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#22c55e] rounded-full"
                        style={{ width: `${Math.round((hours / maxSkillHours) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[#444] w-8 text-right flex-shrink-0">{hours}h</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-[#333] text-sm">Sin horas registradas aún</p>
                <p className="text-[#222] text-xs mt-1">Escanea un QR para acreditar horas</p>
              </div>
            )}
          </div>
        </div>

        {/* Acciones rápidas */}
        <p className="text-[9px] text-[#333] tracking-[0.14em] mb-3">ACCIONES RÁPIDAS</p>
        <div className="grid grid-cols-3 gap-3">
          <Link
            href="/feed"
            className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4 flex flex-col items-center gap-2 hover:border-[#2a2a2a] transition-colors"
          >
            <svg className="w-5 h-5 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="text-[10px] text-[#555] text-center">Explorar feed</span>
          </Link>
          <Link
            href="/scan"
            className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4 flex flex-col items-center gap-2 hover:border-[#2a2a2a] transition-colors"
          >
            <svg className="w-5 h-5 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span className="text-[10px] text-[#555] text-center">Escanear QR</span>
          </Link>
          <Link
            href="/certificates"
            className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4 flex flex-col items-center gap-2 hover:border-[#2a2a2a] transition-colors"
          >
            <svg className="w-5 h-5 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-[10px] text-[#555] text-center">Mis certificados</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
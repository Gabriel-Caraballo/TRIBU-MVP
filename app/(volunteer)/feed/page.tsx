// app/(volunteer)/feed/page.tsx
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Activity {
  id: string;
  title: string;
  description: string;
  required_skills: string[];
  location: string;
  start_time: string;
  end_time: string;
  max_volunteers: number;
  status: string;
  organization?: string;
  registered_count?: number;
  is_registered?: boolean;
}

export default function VolunteerFeed() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [volunteerSkills, setVolunteerSkills] = useState<string[]>([]);
  const [skillFilter, setSkillFilter] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [registeringId, setRegisteringId] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedData();
  }, []);

  async function fetchFeedData() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      // Get volunteer skills
      const { data: volunteerProfile } = await supabase
        .from('volunteer_profiles')
        .select('skills')
        .eq('user_id', session.user.id)
        .single();

      if (volunteerProfile?.skills) {
        setVolunteerSkills(volunteerProfile.skills);
      }

      // Get all open activities with organization info
      const { data: activitiesData } = await supabase
        .from('activities')
        .select(`
          *,
          organization:organizations(name)
        `)
        .eq('status', 'open')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      if (activitiesData) {
        // Get registration status for each activity
        const { data: registrations } = await supabase
          .from('activity_registrations')
          .select('activity_id, status')
          .eq('volunteer_id', session.user.id);

        const registeredIds = new Set(
          registrations?.filter(r => r.status === 'registered').map(r => r.activity_id) || []
        );

        // Get count of registrations for each activity
        const { data: counts } = await supabase
          .from('activity_registrations')
          .select('activity_id')
          .eq('status', 'registered');

        const countMap: Record<string, number> = {};
        counts?.forEach(c => {
          countMap[c.activity_id] = (countMap[c.activity_id] || 0) + 1;
        });

        // Transform data
        const transformedActivities = activitiesData.map(activity => ({
          ...activity,
          organization: (activity as any).organization?.name || 'ONG',
          registered_count: countMap[activity.id] || 0,
          is_registered: registeredIds.has(activity.id)
        }));

        setActivities(transformedActivities);
      }
    } catch (error) {
      console.error('Error fetching feed data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(activityId: string) {
    setRegisteringId(activityId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('activity_registrations')
        .insert({
          activity_id: activityId,
          volunteer_id: session.user.id,
          status: 'registered'
        });

      if (error) {
        console.error('Error registering:', error);
        alert('Error al registrarte. Intenta de nuevo.');
      } else {
        // Refresh data
        await fetchFeedData();
      }
    } catch (error) {
      console.error('Error registering:', error);
    } finally {
      setRegisteringId(null);
    }
  }

  function calculateSkillMatch(activitySkills: string[]) {
    if (!volunteerSkills.length || !activitySkills.length) return 0;
    const matchingSkills = activitySkills.filter(skill =>
      volunteerSkills.some(vs => vs.toLowerCase() === skill.toLowerCase())
    );
    return Math.round((matchingSkills.length / activitySkills.length) * 100);
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

  function calculateHours(startTime: string, endTime: string) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return hours.toFixed(1);
  }

  // Combinar habilidades del voluntario + habilidades de las actividades
  const allSkills = Array.from(new Set([
    ...(volunteerSkills || []),
    ...activities.flatMap(a => a.required_skills || [])
  ])).sort();

  const filteredActivities = activities.filter(activity => {
    if (skillFilter.length > 0 && !activity.required_skills?.some(s => skillFilter.includes(s))) {
      return false;
    }

    if (dateFilter !== 'all') {
      const activityDate = new Date(activity.start_time);
      const today = new Date();

      if (dateFilter === 'week') {
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        if (activityDate > nextWeek) return false;
      } else if (dateFilter === 'month') {
        const nextMonth = new Date();
        nextMonth.setMonth(today.getMonth() + 1);
        if (activityDate > nextMonth) return false;
      }
    }

    if (searchQuery && !activity.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    // Sort by skill match
    const aMatch = calculateSkillMatch(a.required_skills || []);
    const bMatch = calculateSkillMatch(b.required_skills || []);
    if (aMatch !== bMatch) return bMatch - aMatch;
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#22c55e]"></div>
      </div>
    );
  }

  const hasActiveFilters = skillFilter.length > 0 || dateFilter !== 'all';

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            Encuentra tu próxima tarea voluntaria
          </h1>

          {volunteerSkills.length > 0 && activities.some(a =>
            calculateSkillMatch(a.required_skills || []) > 0
          ) && (
              <p className="text-[#22c55e] font-medium mt-2 text-sm">
                Hay actividades que coinciden con tus habilidades
              </p>
            )}
        </div>

        {/* Search & Filters Section */}
        <div className="mb-6 lg:mb-8 space-y-4">
          <div className="flex gap-3">
            {/* Main Search Bar */}
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="¿Qué quieres hacer?"
                className="w-full px-4 py-3 pl-11 border border-[#1f1f1f] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#22c55e] bg-[#111] text-white placeholder:text-[#444] transition-all"
              />
              <svg className="w-5 h-5 text-[#444] absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative px-4 py-3 rounded-xl border transition-all flex items-center gap-2 font-medium ${showFilters || hasActiveFilters
                ? 'bg-[#22c55e] border-[#22c55e] text-black'
                : 'bg-[#111] border-[#1f1f1f] text-white hover:border-[#2a2a2a]'
                }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="hidden sm:inline">Filtros</span>

              {!showFilters && hasActiveFilters && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
              )}
            </button>
          </div>

          {/* Collapsible Filters Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-[#111] border border-[#1f1f1f] rounded-xl transition-all">
              <div className="relative">
                <label className="block text-xs tracking-widest uppercase text-[#888] mb-2 font-semibold">
                  Habilidad
                </label>
                <select
                  value={skillFilter[0] || ''}
                  onChange={(e) => setSkillFilter(e.target.value ? [e.target.value] : [])}
                  className="w-full px-4 py-2.5 border border-[#1f1f1f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] bg-[#0a0a0a] text-white"
                >
                  <option value="">Todas las habilidades</option>
                  {allSkills.map((skill) => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <label className="block text-xs tracking-widest uppercase text-[#888] mb-2 font-semibold">
                  Fecha
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#1f1f1f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] bg-[#0a0a0a] text-white"
                >
                  <option value="all">Todas las fechas</option>
                  <option value="week">Esta semana</option>
                  <option value="month">Este mes</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Activities Grid */}
        {filteredActivities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {filteredActivities.map((activity) => {
              const matchPercentage = calculateSkillMatch(activity.required_skills || []);
              const hours = calculateHours(activity.start_time, activity.end_time);

              return (
                <div
                  key={activity.id}
                  className={`bg-[#111] rounded-xl border border-[#1f1f1f] hover:border-[#2a2a2a] overflow-hidden transition-all ${activity.is_registered ? 'ring-2 ring-[#22c55e]' : ''
                    }`}
                >
                  {matchPercentage > 0 && (
                    <div className={`${matchPercentage >= 75
                      ? 'bg-[rgba(34,197,94,0.15)] text-[#22c55e]'
                      : 'bg-[rgba(245,158,11,0.12)] text-[#f59e0b]'
                      } text-xs font-bold py-2 px-4 text-center`}>
                      {matchPercentage}% match con tus habilidades
                    </div>
                  )}

                  <div className="p-4 lg:p-5">
                    <div className="flex items-center mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#161616] text-[#555] border border-[#1f1f1f]">
                        {activity.organization}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 min-h-[2.5rem]">
                      {activity.title}
                    </h3>

                    <div className="space-y-2.5 mb-4">
                      <div className="flex items-start text-sm text-[#555]">
                        <svg className="w-4 h-4 text-[#444] flex-shrink-0 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <p className="font-medium text-[#aaa]">{formatDate(activity.start_time)}</p>
                          <p className="text-xs text-[#555]">{hours} horas</p>
                        </div>
                      </div>

                      <div className="flex items-start text-sm text-[#555]">
                        <svg className="w-4 h-4 text-[#444] flex-shrink-0 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="line-clamp-1">{activity.location || 'Sin ubicación'}</span>
                      </div>

                      <div className="flex items-center text-sm">
                        <svg className="w-4 h-4 text-[#444] flex-shrink-0 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className={(activity.registered_count || 0) >= (activity.max_volunteers || Infinity) ? 'text-red-400 font-medium' : 'text-[#555]'}>
                          {activity.registered_count || 0}/{activity.max_volunteers || '∞'} voluntarios
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {activity.required_skills?.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${volunteerSkills.some(vs => vs.toLowerCase() === skill.toLowerCase())
                            ? 'bg-[rgba(34,197,94,0.1)] text-[#22c55e] border border-[rgba(34,197,94,0.2)]'
                            : 'bg-[#161616] text-[#555] border border-[#1f1f1f]'
                            }`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {activity.is_registered ? (
                      <div className="w-full py-3 bg-[rgba(34,197,94,0.1)] text-[#22c55e] rounded-lg font-semibold text-center flex items-center justify-center border border-[rgba(34,197,94,0.2)]">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Ya estás registrado
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRegister(activity.id)}
                        disabled={registeringId === activity.id || (activity.registered_count || 0) >= (activity.max_volunteers || Infinity)}
                        className="w-full py-3 bg-[#22c55e] text-black rounded-lg font-bold hover:bg-[#16a34a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {registeringId === activity.id ? (
                          <span className="flex items-center">
                            <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                            Registrando...
                          </span>
                        ) : (
                          <span>Registrarme</span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#111] rounded-xl border border-[#1f1f1f]">
            <h3 className="text-xl font-bold text-white">No hay actividades disponibles</h3>
            <p className="text-[#555] mt-2 mb-6">Prueba con otros filtros o vuelve más tarde</p>
            <button
              onClick={() => {
                setSkillFilter([]);
                setDateFilter('all');
                setSearchQuery('');
              }}
              className="px-6 py-2.5 bg-[#22c55e] text-black rounded-lg font-medium hover:bg-[#16a34a] transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

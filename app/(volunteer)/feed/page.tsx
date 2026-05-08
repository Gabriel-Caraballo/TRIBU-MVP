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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[--tribu-blue]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[--tribu-navy]">
            Encuentra tu próxima tarea voluntaria
          </h1>
          
          {volunteerSkills.length > 0 && activities.some(a => 
            calculateSkillMatch(a.required_skills || []) > 0
          ) && (
            <p className="text-[--tribu-green] font-medium mt-2 flex items-center">
              <span className="text-lg mr-2">✨</span>
              Hay actividades que coinciden con tus habilidades
            </p>
          )}
        </div>

        {/* Filters - Responsive */}
        <div className="bg-white rounded-xl shadow-sm mb-6 lg:mb-8 p-4 lg:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Skill Filter */}
            <div className="relative">
              <label className="block text-sm font-semibold text-[--tribu-navy] mb-2">
                🎯 Habilidad
              </label>
              <select 
                value={skillFilter[0] || ''}
                onChange={(e) => setSkillFilter(e.target.value ? [e.target.value] : [])}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[--tribu-blue] focus:border-transparent bg-white"
              >
                <option value="">Todas las habilidades</option>
                {allSkills.map((skill) => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>
            
            {/* Date Filter */}
            <div className="relative">
              <label className="block text-sm font-semibold text-[--tribu-navy] mb-2">
                📅 Fecha
              </label>
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[--tribu-blue] focus:border-transparent bg-white"
              >
                <option value="all">Todas las fechas</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
              </select>
            </div>
            
            {/* Search */}
            <div className="relative">
              <label className="block text-sm font-semibold text-[--tribu-navy] mb-2">
                🔍 Buscar
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Título de actividad..."
                  className="w-full px-4 py-2.5 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[--tribu-blue] focus:border-transparent"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Activities Grid - Responsive Cards */}
        {filteredActivities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {filteredActivities.map((activity) => {
              const matchPercentage = calculateSkillMatch(activity.required_skills || []);
              const hours = calculateHours(activity.start_time, activity.end_time);
              
              return (
                <div 
                  key={activity.id} 
                  className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                    activity.is_registered ? 'ring-2 ring-green-400' : ''
                  }`}
                >
                  {/* Match Badge */}
                  {matchPercentage > 0 && (
                    <div className={`${
                      matchPercentage >= 75 
                        ? 'bg-gradient-to-r from-green-500 to-green-600' 
                        : matchPercentage >= 50
                        ? 'bg-gradient-to-r from-[--tribu-green] to-green-500'
                        : 'bg-gradient-to-r from-[--tribu-orange] to-orange-500'
                    } text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center`}>
                      <span className="mr-1">🎯</span>
                      {matchPercentage}% match
                    </div>
                  )}
                  
                  <div className="p-4 lg:p-5">
                    {/* Organization Badge */}
                    <div className="flex items-center mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        🏢 {activity.organization}
                      </span>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-lg font-bold text-[--tribu-navy] mb-2 line-clamp-2 min-h-[2.5rem]">
                      {activity.title}
                    </h3>
                    
                    {/* Info Grid */}
                    <div className="space-y-2.5 mb-4">
                      <div className="flex items-start text-sm text-[--tribu-gray]">
                        <span className="w-5 flex-shrink-0 mt-0.5">📅</span>
                        <div>
                          <p className="font-medium">{formatDate(activity.start_time)}</p>
                          <p className="text-xs text-gray-500">{hours} horas</p>
                        </div>
                      </div>

                      <div className="flex items-start text-sm text-[--tribu-gray]">
                        <span className="w-5 flex-shrink-0 mt-0.5">📍</span>
                        <span className="line-clamp-1">{activity.location || 'Sin ubicación'}</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <span className="w-5 flex-shrink-0">👥</span>
                        <span className={(activity.registered_count || 0) >= (activity.max_volunteers || Infinity) ? 'text-red-500 font-medium' : 'text-[--tribu-gray]'}>
                          {activity.registered_count || 0}/{activity.max_volunteers || '∞'} voluntarios
                        </span>
                        {(activity.registered_count || 0) >= (activity.max_volunteers || Infinity) && (
                          <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Lleno</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {activity.required_skills?.slice(0, 4).map((skill) => (
                        <span 
                          key={skill} 
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            volunteerSkills.some(vs => vs.toLowerCase() === skill.toLowerCase())
                              ? 'bg-green-100 text-green-700 border border-green-200'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {skill}
                        </span>
                      ))}
                      {activity.required_skills?.length > 4 && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                          +{activity.required_skills.length - 4}
                        </span>
                      )}
                    </div>
                    
                    {/* Action Button */}
                    {activity.is_registered ? (
                      <div className="w-full py-3 bg-green-100 text-green-700 rounded-lg font-semibold text-center flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        ✅ Ya estás registrado
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRegister(activity.id)}
                        disabled={registeringId === activity.id || (activity.registered_count || 0) >= (activity.max_volunteers || Infinity)}
                        className="w-full py-3 bg-[--tribu-blue] text-white rounded-lg font-semibold hover:bg-[--tribu-navy] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                          <span className="flex items-center">
                            <span className="mr-2">✨</span>
                            Registrarme
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-xl font-bold text-[--tribu-navy]">No hay actividades disponibles</h3>
            <p className="text-[--tribu-gray] mt-2 mb-6">
              Prueba con otros filtros o vuelve más tarde
            </p>
            <button
              onClick={() => {
                setSkillFilter([]);
                setDateFilter('all');
                setSearchQuery('');
              }}
              className="px-6 py-2.5 bg-[--tribu-blue] text-white rounded-lg font-medium hover:bg-[--tribu-navy] transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
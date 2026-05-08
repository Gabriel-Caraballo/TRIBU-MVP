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
    <div className="space-y-6 pb-16 lg:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-[--tribu-navy]">Actividades Disponibles</h1>
        
        {volunteerSkills.length > 0 && activities.some(a => 
          calculateSkillMatch(a.required_skills || []) > 0
        ) && (
          <p className="text-[--tribu-green] font-medium mt-1">
            ✨ Hay actividades que coinciden con tus habilidades
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
              Habilidades
            </label>
            <select 
              value={skillFilter[0] || ''}
              onChange={(e) => setSkillFilter(e.target.value ? [e.target.value] : [])}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-[--tribu-blue] focus:ring-[--tribu-blue]"
            >
              <option value="">Todas las habilidades</option>
              {allSkills.map((skill) => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
              Fecha
            </label>
            <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-[--tribu-blue] focus:ring-[--tribu-blue]"
            >
              <option value="all">Todas las fechas</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
              Buscar
            </label>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar actividad..."
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-[--tribu-blue] focus:ring-[--tribu-blue]"
            />
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      {filteredActivities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity) => {
            const matchPercentage = calculateSkillMatch(activity.required_skills || []);
            
            return (
              <div 
                key={activity.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Match Badge */}
                {matchPercentage > 0 && (
                  <div className={`${
                    matchPercentage > 50 
                      ? 'bg-[--tribu-green]' 
                      : 'bg-[--tribu-orange]'
                  } text-white text-xs font-bold py-1.5 px-3 text-center`}>
                    {matchPercentage}% match con tus habilidades
                  </div>
                )}
                
                <div className="p-5">
                  <h3 className="text-lg font-bold text-[--tribu-navy] mb-1 line-clamp-2">
                    {activity.title}
                  </h3>
                  <p className="text-sm text-[--tribu-gray] mb-3">{activity.organization}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-[--tribu-gray]">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(activity.start_time)}
                    </div>
                    
                    <div className="flex items-center text-sm text-[--tribu-gray]">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {activity.location}
                    </div>
                    
                    <div className="flex items-center text-sm text-[--tribu-gray]">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {activity.registered_count || 0}/{activity.max_volunteers || '∞'} voluntarios
                    </div>
                  </div>
                  
                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {activity.required_skills?.map((skill) => (
                      <span 
                        key={skill} 
                        className={`text-xs px-2 py-1 rounded-full ${
                          volunteerSkills.some(vs => vs.toLowerCase() === skill.toLowerCase())
                            ? 'bg-[--tribu-green-light] text-[--tribu-green]'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  {/* Action Button */}
                  {activity.is_registered ? (
                    <div className="flex items-center justify-between">
                      <span className="text-[--tribu-green] flex items-center text-sm font-medium">
                        <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Registrado
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRegister(activity.id)}
                      disabled={registeringId === activity.id}
                      className="w-full py-2.5 bg-[--tribu-blue] text-white rounded-lg font-medium hover:bg-[--tribu-navy] transition-colors disabled:opacity-50"
                    >
                      {registeringId === activity.id ? 'Registrando...' : 'Registrarme'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No hay actividades disponibles</h3>
          <p className="mt-2 text-sm text-gray-500">
            Prueba con otros filtros o vuelve más tarde
          </p>
          <button
            onClick={() => {
              setSkillFilter([]);
              setDateFilter('all');
              setSearchQuery('');
            }}
            className="mt-4 text-[--tribu-blue] hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
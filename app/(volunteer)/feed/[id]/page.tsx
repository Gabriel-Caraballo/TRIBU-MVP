// app/(volunteer)/feed/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Activity {
  id: string;
  title: string;
  description: string | null;
  required_skills: string[];
  location: string | null;
  start_time: string;
  end_time: string;
  max_volunteers: number | null;
  status: string;
  organization?: {
    name: string;
    logo_url?: string;
    description?: string;
  };
  org_id: string;
}

interface Registration {
  id: string;
  status: string;
  registered_at: string;
}

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const activityId = params.id as string;
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [volunteerSkills, setVolunteerSkills] = useState<string[]>([]);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchActivityData();
  }, [activityId]);

  async function fetchActivityData() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      // Get activity with organization
      const { data: activityData } = await supabase
        .from('activities')
        .select(`
          *,
          organization:organizations(name, logo_url, description)
        `)
        .eq('id', activityId)
        .single();

      if (!activityData) {
        setMessage({ type: 'error', text: 'Actividad no encontrada' });
        setLoading(false);
        return;
      }

      setActivity({
        ...activityData,
        organization: (activityData as any).organization
      });

      // Get volunteer skills
      const { data: volunteerProfile } = await supabase
        .from('volunteer_profiles')
        .select('skills')
        .eq('user_id', session.user.id)
        .single();
      
      if (volunteerProfile?.skills) {
        setVolunteerSkills(volunteerProfile.skills);
      }

      // Get user's registration for this activity
      const { data: registrationData } = await supabase
        .from('activity_registrations')
        .select('*')
        .eq('activity_id', activityId)
        .eq('volunteer_id', session.user.id)
        .single();

      setRegistration(registrationData);
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestJoin() {
    setRegistering(true);
    setMessage(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Check if already registered
      if (registration) {
        setMessage({ type: 'error', text: 'Ya estás registrado en esta actividad' });
        setRegistering(false);
        return;
      }

      // Check capacity
      if (activity?.max_volunteers) {
        const { count } = await supabase
          .from('activity_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('activity_id', activityId)
          .in('status', ['pending', 'approved', 'registered']);

        if (count && count >= activity.max_volunteers) {
          setMessage({ type: 'error', text: 'Esta actividad ya está llena' });
          setRegistering(false);
          return;
        }
      }

      // Create registration with status 'pending' (requires approval)
      const { error } = await supabase
        .from('activity_registrations')
        .insert({
          activity_id: activityId,
          volunteer_id: session.user.id,
          status: 'pending'
        });

      if (error) {
        console.error('Error registering:', error);
        setMessage({ type: 'error', text: 'Error al solicitar unirte. Intenta de nuevo.' });
      } else {
        setMessage({ type: 'success', text: '¡Solicitud enviada! La ONG revisará tu solicitud.' });
        // Refresh registration data
        await fetchActivityData();
      }
    } catch (error) {
      console.error('Error registering:', error);
      setMessage({ type: 'error', text: 'Error al solicitar unirte.' });
    } finally {
      setRegistering(false);
    }
  }

  async function handleCancelRegistration() {
    if (!registration) return;
    
    const { error } = await supabase
      .from('activity_registrations')
      .delete()
      .eq('id', registration.id);

    if (error) {
      setMessage({ type: 'error', text: 'Error al cancelar registro.' });
    } else {
      setMessage({ type: 'success', text: 'Registro cancelado.' });
      setRegistration(null);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-DO', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
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

  function calculateSkillMatch() {
    if (!activity?.required_skills?.length || !volunteerSkills.length) return 0;
    const matching = activity.required_skills.filter(skill => 
      volunteerSkills.some(vs => vs.toLowerCase() === skill.toLowerCase())
    );
    return Math.round((matching.length / activity.required_skills.length) * 100);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#22c55e]"></div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="max-w-3xl mx-auto pb-20 bg-[#0a0a0a] text-center py-12">
        <h2 className="text-xl font-bold text-white">Actividad no encontrada</h2>
        <Link href="/feed" className="text-[#22c55e] hover:underline mt-4 inline-block">
          ← Volver al feed
        </Link>
      </div>
    );
  }

  const matchPercentage = calculateSkillMatch();
  const hours = calculateHours(activity.start_time, activity.end_time);

  return (
    <div className="max-w-3xl mx-auto pb-20 bg-[#0a0a0a]">
      <Link href="/feed" className="text-[#22c55e] hover:underline inline-flex items-center mb-4">
        ← Volver al feed
      </Link>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg mb-4 ${
          message.type === 'success' ? 'bg-[rgba(34,197,94,0.1)] text-[#22c55e] border border-[rgba(34,197,94,0.2)]' : 'bg-[rgba(239,68,68,0.08)] text-red-400 border border-[rgba(239,68,68,0.2)]'
        }`}>
          {message.text}
        </div>
      )}

      {/* Main Card */}
      <div className="bg-[#111] rounded-xl border border-[#1f1f1f] overflow-hidden">
        {/* Match Banner */}
        {matchPercentage > 0 && (
          <div className={`px-6 py-3 ${
            matchPercentage >= 75 
              ? 'bg-[rgba(34,197,94,0.12)] text-[#22c55e]' 
              : matchPercentage >= 50
              ? 'bg-[rgba(34,197,94,0.10)] text-[#22c55e]'
              : 'bg-[rgba(245,158,11,0.10)] text-[#f59e0b]'
          }`}>
            <span className="font-bold">{matchPercentage}%</span> de coincidencia con tus habilidades
          </div>
        )}

        <div className="p-6">
          {/* Organization */}
          <div className="flex items-center mb-4">
            {activity.organization?.logo_url ? (
              <img 
                src={activity.organization.logo_url} 
                alt={activity.organization.name}
                className="w-12 h-12 rounded-full object-cover mr-3"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#161616] border border-[#1f1f1f] flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-[#555]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            )}
            <div>
              <p className="text-xs text-[#555]">Organización</p>
              <p className="font-medium text-white">{activity.organization?.name || 'ONG'}</p>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-4">{activity.title}</h1>

          {/* Description */}
          {activity.description && (
            <p className="text-[#aaa] mb-6">{activity.description}</p>
          )}

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-[#444] flex-shrink-0 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-xs text-[#555]">Fecha y hora</p>
                <p className="font-medium text-white">{formatDate(activity.start_time)}</p>
                <p className="text-sm text-[#555]">{hours} horas</p>
              </div>
            </div>
            <div className="flex items-start">
              <svg className="w-5 h-5 text-[#444] flex-shrink-0 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="text-xs text-[#555]">Ubicación</p>
                <p className="font-medium text-[#aaa]">{activity.location || 'Por definir'}</p>
              </div>
            </div>
          </div>

          {/* Required Skills */}
          <div className="mb-6">
            <p className="text-xs text-[#555] mb-2">Habilidades requeridas</p>
            <div className="flex flex-wrap gap-2">
              {activity.required_skills?.map((skill) => (
                <span 
                  key={skill}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    volunteerSkills.some(vs => vs.toLowerCase() === skill.toLowerCase())
                      ? 'bg-[rgba(34,197,94,0.1)] text-[#22c55e] border border-[rgba(34,197,94,0.2)]'
                      : 'bg-[#161616] text-[#555] border border-[#1f1f1f]'
                  }`}
                >
                  {skill} {volunteerSkills.some(vs => vs.toLowerCase() === skill.toLowerCase()) && '✓'}
                </span>
              ))}
              {(!activity.required_skills || activity.required_skills.length === 0) && (
                <span className="text-[#555]">No se requieren habilidades específicas</span>
              )}
            </div>
          </div>

          {/* Capacity */}
          {activity.max_volunteers && (
            <div className="mb-6 p-4 bg-[#161616] border border-[#1f1f1f] rounded-lg">
              <p className="text-xs text-[#555]">Cupo máximo</p>
              <p className="font-bold text-white">{activity.max_volunteers} voluntarios</p>
            </div>
          )}

          {/* Registration Status */}
          {registration && (
            <div className={`mb-6 p-4 rounded-lg ${
              registration.status === 'approved' ? 'bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.2)]' :
              registration.status === 'pending' ? 'bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)]' :
              registration.status === 'attended' ? 'bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.2)]' :
              'bg-[#161616] border border-[#1f1f1f]'
            }`}>
              <p className="font-medium">
                {registration.status === 'approved' && 'Estás aprobado para esta actividad'}
                {registration.status === 'pending' && 'Tu solicitud está pendiente de aprobación'}
                {registration.status === 'attended' && 'Asististe a esta actividad'}
                {registration.status === 'cancelled' && 'Tu registro fue cancelado'}
              </p>
              {registration.status !== 'attended' && registration.status !== 'cancelled' && (
                <button
                  onClick={handleCancelRegistration}
                  className="mt-2 text-sm text-red-400 hover:underline"
                >
                  Cancelar registro
                </button>
              )}
            </div>
          )}

          {/* Action Button */}
          {!registration && activity.status === 'open' && (
            <button
              onClick={handleRequestJoin}
              disabled={registering}
              className="w-full py-4 bg-[#22c55e] text-black rounded-lg font-bold text-lg hover:bg-[#16a34a] transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {registering ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Enviando solicitud...
                </>
              ) : (
                <>Solicitar unirme</>
              )}
            </button>
          )}

          {activity.status !== 'open' && !registration && (
            <div className="w-full py-4 bg-[#161616] text-[#444] rounded-lg font-bold text-lg text-center border border-[#1f1f1f]">
              Esta actividad no está abierta
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
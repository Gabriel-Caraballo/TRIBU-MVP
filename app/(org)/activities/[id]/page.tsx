// app/(org)/activities/[id]/page.tsx
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
  is_private: boolean;
  org_id: string;
}

interface Registration {
  id: string;
  volunteer_id: string;
  status: string;
  registered_at: string;
  user?: {
    full_name: string;
    email: string;
  };
  volunteer_profile?: {
    skills: string[];
    total_hours: number;
  };
}

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const activityId = params.id as string;
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);
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

      // Get activity
      const { data: activityData } = await supabase
        .from('activities')
        .select('*')
        .eq('id', activityId)
        .single();

      if (!activityData) {
        setMessage({ type: 'error', text: 'Actividad no encontrada' });
        setLoading(false);
        return;
      }

      // Verify org ownership
      const { data: orgMember } = await supabase
        .from('org_members')
        .select('org_id')
        .eq('user_id', session.user.id)
        .single();

      if (!orgMember || activityData.org_id !== orgMember.org_id) {
        setMessage({ type: 'error', text: 'No tienes acceso a esta actividad' });
        setLoading(false);
        return;
      }

      setActivity(activityData);

      // Get registrations with volunteer details
      const { data: registrationsData } = await supabase
        .from('activity_registrations')
        .select('*')
        .eq('activity_id', activityId)
        .order('registered_at', { ascending: true });

      if (registrationsData && registrationsData.length > 0) {
        // Get volunteer details
        const volunteerIds = registrationsData.map(r => r.volunteer_id);
        
        const { data: users } = await supabase
          .from('user_profiles')
          .select('id, full_name, email')
          .in('id', volunteerIds);

        const { data: profiles } = await supabase
          .from('volunteer_profiles')
          .select('user_id, skills, total_hours')
          .in('user_id', volunteerIds);

        const userMap = new Map(users?.map(u => [u.id, u]) || []);
        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

        setRegistrations(registrationsData.map(r => ({
          ...r,
          user: userMap.get(r.volunteer_id),
          volunteer_profile: profileMap.get(r.volunteer_id)
        })));
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateRegistrationStatus(regId: string, newStatus: string) {
    setUpdating(regId);
    setMessage(null);
    
    const { error } = await supabase
      .from('activity_registrations')
      .update({ status: newStatus })
      .eq('id', regId);

    if (error) {
      setMessage({ type: 'error', text: 'Error al actualizar estado' });
    } else {
      setMessage({ type: 'success', text: 'Estado actualizado correctamente' });
      await fetchActivityData();
    }
    
    setUpdating(null);
  }

  async function updateActivityStatus(newStatus: string) {
    if (!activity) return;
    
    setUpdating('status');
    setMessage(null);

    const { error } = await supabase
      .from('activities')
      .update({ status: newStatus })
      .eq('id', activity.id);

    if (error) {
      setMessage({ type: 'error', text: 'Error al actualizar estado de la actividad' });
    } else {
      setMessage({ type: 'success', text: 'Estado actualizado correctamente' });
      setActivity({ ...activity, status: newStatus });
    }

    setUpdating('status');
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

  function getStatusLabel(status: string) {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      approved: 'Aprobado',
      attended: 'Asistió',
      absent: 'Inasistente',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  }

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      attended: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  function getActivityStatusLabel(status: string) {
    const labels: Record<string, string> = {
      draft: 'Borrador',
      open: 'Abierta',
      in_progress: 'En progreso',
      completed: 'Completada',
      cancelled: 'Cancelada'
    };
    return labels[status] || status;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[--tribu-blue]"></div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-[--tribu-navy]">Actividad no encontrada</h2>
        <Link href="/activities" className="text-[--tribu-blue] hover:underline mt-4 inline-block">
          ← Volver a actividades
        </Link>
      </div>
    );
  }

  const pendingRegs = registrations.filter(r => r.status === 'pending');
  const approvedRegs = registrations.filter(r => r.status === 'approved');

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <Link href="/activities" className="text-[--tribu-blue] hover:underline inline-flex items-center mb-4">
        ← Volver a actividades
      </Link>

      {message && (
        <div className={`p-4 rounded-lg mb-4 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Activity Header */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-[--tribu-navy]">{activity.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              activity.status === 'open' ? 'bg-blue-100 text-blue-800' :
              activity.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
              activity.status === 'completed' ? 'bg-green-100 text-green-800' :
              activity.status === 'draft' ? 'bg-gray-100 text-gray-800' :
              'bg-red-100 text-red-800'
            }`}>
              {getActivityStatusLabel(activity.status)}
            </span>
          </div>

          {activity.description && (
            <p className="text-[--tribu-gray] mb-4">{activity.description}</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-[--tribu-gray]">📅 Inicio</p>
              <p className="font-medium">{formatDate(activity.start_time)}</p>
            </div>
            <div>
              <p className="text-[--tribu-gray]">⏰ Fin</p>
              <p className="font-medium">{formatDate(activity.end_time)}</p>
            </div>
            <div>
              <p className="text-[--tribu-gray]">📍 Ubicación</p>
              <p className="font-medium">{activity.location || 'Por definir'}</p>
            </div>
            <div>
              <p className="text-[--tribu-gray]">👥 Cupo</p>
              <p className="font-medium">{activity.max_volunteers || 'Ilimitado'}</p>
            </div>
          </div>

          {/* Skills */}
          {activity.required_skills?.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-[--tribu-gray] mb-2">Habilidades requeridas:</p>
              <div className="flex flex-wrap gap-2">
                {activity.required_skills.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            {activity.status === 'draft' && (
              <button
                onClick={() => updateActivityStatus('open')}
                disabled={updating === 'status'}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
              >
                Publicar actividad
              </button>
            )}
            
            {activity.status === 'open' && (
              <button
                onClick={() => updateActivityStatus('in_progress')}
                disabled={updating === 'status'}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 disabled:opacity-50"
              >
                Iniciar actividad
              </button>
            )}
            
            {activity.status === 'in_progress' && (
              <>
                <Link
                  href={`/activities/${activity.id}/qr`}
                  className="px-4 py-2 bg-[--tribu-blue] text-white rounded-lg font-medium hover:bg-[--tribu-navy]"
                >
                  📷 Mostrar QR
                </Link>
                <button
                  onClick={() => updateActivityStatus('completed')}
                  disabled={updating === 'status'}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  Cerrar actividad
                </button>
              </>
            )}

            {activity.status === 'completed' && (
              <div className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg font-medium">
                ✅ Actividad completada
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      {pendingRegs.length > 0 && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-[--tribu-navy]">
              ⏳ Solicitudes pendientes ({pendingRegs.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingRegs.map(reg => (
              <div key={reg.id} className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-[--tribu-navy]">{reg.user?.full_name || 'Voluntario'}</p>
                  <p className="text-sm text-[--tribu-gray]">{reg.user?.email}</p>
                  {reg.volunteer_profile?.skills && reg.volunteer_profile.skills.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {reg.volunteer_profile.skills.slice(0, 3).map(s => (
                        <span key={s} className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateRegistrationStatus(reg.id, 'approved')}
                    disabled={updating === reg.id}
                    className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => updateRegistrationStatus(reg.id, 'cancelled')}
                    disabled={updating === reg.id}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 disabled:opacity-50"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved Volunteers */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[--tribu-navy]">
            ✅ Voluntarios confirmados ({approvedRegs.length})
          </h2>
        </div>
        {approvedRegs.length === 0 ? (
          <div className="p-8 text-center text-[--tribu-gray]">
            No hay voluntarios aprobados aún
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {approvedRegs.map(reg => (
              <div key={reg.id} className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-[--tribu-navy]">{reg.user?.full_name || 'Voluntario'}</p>
                  <p className="text-sm text-[--tribu-gray]">{reg.user?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {reg.status === 'attended' && (
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                        ✅ Asistió
                      </span>
                    )}
                    {reg.volunteer_profile && (
                      <span className="text-xs text-[--tribu-gray]">
                        {reg.volunteer_profile.total_hours} horas acumuladas
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
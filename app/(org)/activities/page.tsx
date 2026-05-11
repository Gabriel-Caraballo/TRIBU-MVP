// app/(org)/activities/page.tsx
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Activity {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string;
  end_time: string;
  max_volunteers: number;
  status: string;
  required_skills: string[];
  registered_count?: number;
}

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: 'Borrador', color: 'text-[#555]', bg: 'bg-[#161616] border border-[#1f1f1f]' },
  open: { label: 'Abierta', color: 'text-[#22c55e]', bg: 'bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)]' },
  in_progress: { label: 'En progreso', color: 'text-[#f59e0b]', bg: 'bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)]' },
  completed: { label: 'Completada', color: 'text-[#22c55e]', bg: 'bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.15)]' },
  cancelled: { label: 'Cancelada', color: 'text-red-400', bg: 'bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.15)]' }
};

export default function ActivitiesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  async function fetchActivities() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get org_id
      const { data: orgMember } = await supabase
        .from('org_members')
        .select('org_id')
        .eq('user_id', session.user.id)
        .single();

      if (!orgMember) {
        setLoading(false);
        return;
      }

      setOrgId(orgMember.org_id);

      // Get activities
      const { data: activitiesData } = await supabase
        .from('activities')
        .select('*')
        .eq('org_id', orgMember.org_id)
        .order('created_at', { ascending: false });

      // Get registration counts
      const { data: counts } = await supabase
        .from('activity_registrations')
        .select('activity_id, status')
        .eq('status', 'registered');

      const countMap: Record<string, number> = {};
      counts?.forEach(c => {
        countMap[c.activity_id] = (countMap[c.activity_id] || 0) + 1;
      });

      setActivities((activitiesData || []).map(a => ({
        ...a,
        registered_count: countMap[a.id] || 0
      })));
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(activityId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('activities')
        .update({ status: newStatus })
        .eq('id', activityId);

      if (error) throw error;

      // Refresh activities
      await fetchActivities();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar estado');
    }
  }

  async function generateQRToken(activityId: string) {
    try {
      // Check if token already exists
      const { data: existingToken } = await supabase
        .from('qr_tokens')
        .select('token')
        .eq('activity_id', activityId)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (existingToken) {
        alert(`Ya existe un código QR activo. Token: ${existingToken.token}`);
        return;
      }

      // Generate new token
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes

      const { error } = await supabase
        .from('qr_tokens')
        .insert({
          activity_id: activityId,
          token: token,
          expires_at: expiresAt
        });

      if (error) throw error;

      alert(`Código QR generado:\n\n${token}\n\nVálido por 30 minutos.`);

    } catch (error) {
      console.error('Error generating QR:', error);
      alert('Error al generar código QR');
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-DO', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  function getDuration(startTime: string, endTime: string) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return hours.toFixed(1);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#22c55e]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Actividades</h1>
        <Link
          href="/activities/new"
          className="px-4 py-2 bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold rounded-lg"
        >
          + Nueva Actividad
        </Link>
      </div>

      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="bg-[#111] rounded-lg border border-[#1f1f1f] overflow-hidden">
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{activity.title}</h3>
                    <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium mt-1 ${statusLabels[activity.status]?.bg + ' ' + statusLabels[activity.status]?.color
                      }`}>
                      {statusLabels[activity.status]?.label}
                    </span>
                  </div>

                  {/* Acciones según estado */}
                  <div className="flex gap-2">
                    {activity.status === 'draft' && (
                      <button
                        onClick={() => updateStatus(activity.id, 'open')}
                        className="text-xs px-3 py-1 bg-[rgba(34,197,94,0.1)] text-[#22c55e] border border-[rgba(34,197,94,0.2)] rounded-full hover:bg-[rgba(34,197,94,0.2)]"
                      >
                        Publicar
                      </button>
                    )}

                    {activity.status === 'open' && (
                      <button
                        onClick={() => updateStatus(activity.id, 'in_progress')}
                        className="text-xs px-3 py-1 bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border border-[rgba(245,158,11,0.2)] rounded-full hover:bg-[rgba(245,158,11,0.2)]"
                      >
                        Iniciar
                      </button>
                    )}

                    {activity.status === 'in_progress' && (
                      <button
                        onClick={() => updateStatus(activity.id, 'completed')}
                        className="text-xs px-3 py-1 bg-[#161616] text-[#aaa] border border-[#1f1f1f] rounded-full hover:bg-[#1f1f1f]"
                      >
                        Completar
                      </button>
                    )}

                    {activity.status === 'completed' && (
                      <Link
                        href={`/activities/${activity.id}/qr`}
                        className="text-xs px-3 py-1 bg-[#22c55e] text-black font-bold rounded-full hover:bg-[#16a34a]"
                      >
                        Ver QR
                      </Link>
                    )}
                  </div>
                </div>

                {activity.description && (
                  <p className="text-sm text-[#555] mt-2">{activity.description}</p>
                )}

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-[#444] text-xs tracking-wider">Fecha</p>
                    <p className="font-medium text-[#aaa]">{formatDate(activity.start_time)}</p>
                  </div>
                  <div>
                    <p className="text-[#444] text-xs tracking-wider">Duración</p>
                    <p className="font-medium text-[#aaa]">{getDuration(activity.start_time, activity.end_time)} hrs</p>
                  </div>
                  <div>
                    <p className="text-[#444] text-xs tracking-wider">Ubicación</p>
                    <p className="font-medium text-[#aaa]">{activity.location || 'No especificada'}</p>
                  </div>
                  <div>
                    <p className="text-[#444] text-xs tracking-wider">Voluntarios</p>
                    <p className="font-medium text-[#aaa]">
                      {activity.registered_count || 0}/{activity.max_volunteers || '∞'}
                    </p>
                  </div>
                </div>

                {/* Skills requeridos */}
                {activity.required_skills?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {activity.required_skills.map((skill) => (
                      <span key={skill} className="text-xs px-2 py-1 bg-[#161616] text-[#555] border border-[#1f1f1f] rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-[#111] rounded-lg border border-[#1f1f1f]">
          <svg className="mx-auto h-12 w-12 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-white">No hay actividades</h3>
          <p className="mt-2 text-sm text-[#555]">Crea tu primera actividad para voluntarios</p>
          <Link
            href="/activities/new"
            className="mt-4 inline-block px-4 py-2 bg-[#22c55e] text-black font-bold rounded-lg hover:bg-[#16a34a]"
          >
            Crear actividad
          </Link>
        </div>
      )}
    </div>
  );
}
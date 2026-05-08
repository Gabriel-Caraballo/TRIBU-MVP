// app/(org)/activities/[id]/qr/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import QRCode from 'react-qr-code';

interface Activity {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
  required_skills: string[];
}

export default function ActivityQRPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [attendeeCount, setAttendeeCount] = useState(0);

  const activityId = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    if (activityId) {
      fetchData();
      
      const channel = supabase
        .channel(`activity:${activityId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'attendance_logs',
          filter: `activity_id=eq.${activityId}`
        }, () => {
          fetchAttendeeCount();
        })
        .subscribe();

      const interval = setInterval(() => {
        fetchAttendeeCount();
      }, 5000);

      return () => {
        supabase.removeChannel(channel);
        clearInterval(interval);
      };
    }
  }, [activityId]);

  async function fetchData() {
    setLoading(true);
    try {
      const { data: activityData } = await supabase
        .from('activities')
        .select('id, title, start_time, end_time, status, required_skills')
        .eq('id', activityId)
        .single();

      if (!activityData) {
        router.push('/activities');
        return;
      }

      setActivity(activityData);
      await fetchAttendeeCount();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAttendeeCount() {
    try {
      const { count } = await supabase
        .from('attendance_logs')
        .select('*', { count: 'exact', head: true })
        .eq('activity_id', activityId);

      setAttendeeCount(count || 0);
    } catch (error) {
      console.error('Error fetching count:', error);
    }
  }

  function calculateHours(): string {
    if (!activity) return '0';
    const start = new Date(activity.start_time);
    const end = new Date(activity.end_time);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return hours.toFixed(1);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[--tribu-blue]"></div>
      </div>
    );
  }

  const qrValue = activityId;

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[--tribu-navy]">{activity?.title}</h1>
        <p className="text-[--tribu-gray] mt-1">Código QR</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="bg-white p-4 inline-block rounded-lg border-2 border-gray-100">
          <QRCode 
            value={qrValue} 
            size={250}
            level="H"
          />
        </div>

        <p className="text-xs text-[--tribu-gray] mt-4">
          Escanea este código para acreditar horas
        </p>

        <p className="text-lg font-bold text-[--tribu-navy] mt-2">
          {calculateHours()} horas
        </p>
      </div>

      <div className="bg-gradient-to-r from-[--tribu-green] to-green-600 rounded-xl p-6 text-white text-center">
        <p className="text-green-100 text-sm">Voluntarios que acreditaron</p>
        <div className="text-5xl font-bold mt-2">{attendeeCount}</div>
        <p className="text-green-100 text-sm mt-1">
          {activity?.required_skills?.join(', ') || 'Sin habilidades requeridas'}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-bold text-[--tribu-navy] mb-3">Comparte este código</h3>
        <ol className="text-sm text-[--tribu-gray] space-y-2 list-decimal list-inside">
          <li>Los voluntarios escanean este código</li>
          <li>Una sola vez por persona</li>
          <li>Las horas se acreditan automáticamente</li>
        </ol>
      </div>

      <button
        onClick={() => router.push('/activities')}
        className="w-full py-3 text-center text-[--tribu-blue] hover:underline"
      >
        ← Volver a actividades
      </button>
    </div>
  );
}
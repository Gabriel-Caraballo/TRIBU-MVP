// app/(volunteer)/wallet/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface WalletActivity {
  id: string;
  activity_title: string;
  hours_earned: number;
  organization_name: string;
  completed_at: string;
}

interface VolunteerProfile {
  id: string;
  user_id: string;
  total_hours: number;
}

export default function WalletPage() {
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [activities, setActivities] = useState<WalletActivity[]>([]);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get volunteer profile
      const { data: profileData } = await supabase
        .from('volunteer_profiles')
        .select('id, user_id, total_hours')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setTotalHours(profileData.total_hours || 0);
      }

      // Get activity history with earned hours
      const { data: activityData } = await supabase
        .from('activity_participants')
        .select(`
          id,
          hours_earned,
          status,
          completed_at,
          activities:activities(
            id,
            title,
            organization_id,
            organizations:organizations(name)
          )
        `)
        .eq('volunteer_id', profileData?.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(20);

      if (activityData) {
        const formatted = activityData
          .filter((item: any) => item.activities)
          .map((item: any) => ({
            id: item.id,
            activity_title: item.activities.title,
            organization_name: item.activities.organizations?.name || 'Organización',
            hours_earned: item.hours_earned || 0,
            completed_at: item.completed_at || ''
          }));
        setActivities(formatted);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getUserLevel = (hours: number): string => {
    if (hours >= 50) return 'Experto';
    if (hours >= 10) return 'Activo';
    return 'Nuevo';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#22c55e]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white mb-6">Mi Billetera</h1>

        {/* Tarjeta de horas - Diseño tipo debit card */}
        <div className="bg-[#111] rounded-2xl p-6 border border-[#22c55e] border-opacity-30 mb-6">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-sm text-[#555]">Horas Disponibles</p>
              <p className="text-4xl font-bold text-[#22c55e] mt-1">{totalHours}</p>
            </div>
            <div className="bg-[rgba(34,197,94,0.15)] rounded-full p-3">
              <svg className="w-8 h-8 text-[#22c55e]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-[#555]">Volunteer</p>
              <p className="text-sm text-white">TRIBU</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#555]">Nivel</p>
              <p className="text-sm font-medium text-[#22c55e]">{getUserLevel(totalHours)}</p>
            </div>
          </div>
        </div>

        {/* Historial de actividades */}
        <div className="bg-[#111] rounded-xl border border-[#1f1f1f]">
          <div className="p-4 border-b border-[#1f1f1f]">
            <h2 className="font-semibold text-white">Historial de Actividades</h2>
          </div>
          
          {activities.length === 0 ? (
            <div className="p-8 text-center text-[#555]">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>No hay actividades completadas aún</p>
              <p className="text-sm mt-1">¡Participa en actividades para ganar horas!</p>
            </div>
          ) : (
            <div className="divide-y divide-[#1f1f1f]">
              {activities.map((activity) => (
                <div key={activity.id} className="p-4 flex justify-between items-center hover:bg-[#161616]">
                  <div className="flex-1">
                    <p className="font-medium text-white">{activity.activity_title}</p>
                    <p className="text-sm text-[#555]">{activity.organization_name}</p>
                    <p className="text-xs text-[#555] mt-1">{formatDate(activity.completed_at)}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[rgba(34,197,94,0.1)] text-[#22c55e] border border-[rgba(34,197,94,0.2)]">
                      +{activity.hours_earned}h
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// app/(org)/volunteers/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Volunteer {
  id: string;
  full_name: string;
  email: string;
  total_activities: number;
  total_hours: number;
}

export default function VolunteersPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchVolunteers();
  }, []);

  async function fetchVolunteers() {
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

      // Get activities for this org
      const { data: activities } = await supabase
        .from('activities')
        .select('id')
        .eq('org_id', orgMember.org_id);

      if (!activities || activities.length === 0) {
        setVolunteers([]);
        setLoading(false);
        return;
      }

      const activityIds = activities.map(a => a.id);

      // Get registrations
      const { data: registrations } = await supabase
        .from('activity_registrations')
        .select('volunteer_id, status, activity_id')
        .in('activity_id', activityIds);

      // Get attendance logs separately
      const { data: attendanceLogs } = await supabase
        .from('attendance_logs')
        .select('volunteer_id, hours_credited')
        .in('activity_id', activityIds);

      // Create a map of volunteer -> hours
      const volunteerHoursMap = new Map<string, number>();
      for (const log of attendanceLogs || []) {
        const current = volunteerHoursMap.get(log.volunteer_id) || 0;
        volunteerHoursMap.set(log.volunteer_id, current + (parseFloat(log.hours_credited) || 0));
      }

      // Aggregate volunteer data
      const volunteerMap = new Map<string, Volunteer>();
      const volunteerActivityCount = new Map<string, number>();

      for (const reg of registrations || []) {
        const volId = reg.volunteer_id;
        const hours = volunteerHoursMap.get(volId) || 0;

        // Count activities
        const actCount = volunteerActivityCount.get(volId) || 0;
        volunteerActivityCount.set(volId, actCount + 1);

        if (!volunteerMap.has(volId)) {
          // Get volunteer name
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('full_name, email')
            .eq('id', volId)
            .single();

          volunteerMap.set(volId, {
            id: volId,
            full_name: profile?.full_name || 'Voluntario',
            email: profile?.email || '',
            total_activities: 0,
            total_hours: hours
          });
        }
      }

      // Update activity counts
      Array.from(volunteerActivityCount.entries()).forEach(([volId, count]) => {
        const vol = volunteerMap.get(volId);
        if (vol) vol.total_activities = count;
      });

      setVolunteers(Array.from(volunteerMap.values()));
    } catch (error) {
      console.error('Error fetching volunteers:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredVolunteers = volunteers.filter(v => 
    v.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[--tribu-blue]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[--tribu-navy]">Voluntarios</h1>
          <p className="text-[--tribu-gray]">Voluntarios que han participado en tus actividades</p>
        </div>
        <div className="text-lg font-medium text-[--tribu-blue]">
          {volunteers.length} voluntario{volunteers.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar voluntarios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[--tribu-blue] focus:border-transparent"
        />
        <svg 
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Table */}
      {filteredVolunteers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="mt-4 text-gray-500">
            {searchQuery ? 'No se encontraron voluntarios' : 'Aún no hay voluntarios registrados'}
          </p>
          {!searchQuery && (
            <p className="mt-2 text-sm text-gray-400">Crea actividades para atraer voluntarios</p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Voluntario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actividades
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horas
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVolunteers.map((volunteer) => (
                <tr key={volunteer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-[--tribu-blue] text-white flex items-center justify-center font-medium">
                        {volunteer.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{volunteer.full_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {volunteer.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {volunteer.total_activities}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {volunteer.total_hours}h
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
// app/(org)/volunteers/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Volunteer {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  total_activities: number;
  total_hours: number;
  bio: string | null;
  skills: string[] | null;
  city: string | null;
  university: string | null;
  career: string | null;
  level: string;
}

export default function VolunteersPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);

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
            .select('full_name, email, avatar_url')
            .eq('id', volId)
            .single();

          const { data: volProfile } = await supabase
            .from('volunteer_profiles')
            .select('bio, skills, city, university, career, total_hours')
            .eq('user_id', volId)
            .maybeSingle();

          const totalHoursVol = volProfile?.total_hours || hours;
          const level = totalHoursVol >= 150 ? 'Experto' : totalHoursVol >= 10 ? 'Activo' : 'Rookie';

          volunteerMap.set(volId, {
            id: volId,
            full_name: profile?.full_name || 'Voluntario',
            email: profile?.email || '',
            avatar_url: profile?.avatar_url || null,
            total_activities: 0,
            total_hours: totalHoursVol,
            bio: volProfile?.bio || null,
            skills: volProfile?.skills || null,
            city: volProfile?.city || null,
            university: volProfile?.university || null,
            career: volProfile?.career || null,
            level,
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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#22c55e]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Voluntarios</h1>
          <p className="text-[#555]">Voluntarios que han participado en tus actividades</p>
        </div>
        <div className="text-lg font-medium text-[#22c55e]">
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
          className="w-full px-4 py-3 pl-10 bg-[#111] border border-[#1f1f1f] text-white placeholder-[#333] rounded-lg focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
        />
        <svg 
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#333]"
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Table */}
      {filteredVolunteers.length === 0 ? (
        <div className="text-center py-12 bg-[#111] rounded-lg border border-[#1f1f1f]">
          <svg className="mx-auto h-12 w-12 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="mt-4 text-[#555]">
            {searchQuery ? 'No se encontraron voluntarios' : 'Aún no hay voluntarios registrados'}
          </p>
          {!searchQuery && (
            <p className="mt-2 text-sm text-[#333]">Crea actividades para atraer voluntarios</p>
          )}
        </div>
      ) : (
        <div className="bg-[#111] rounded-lg border border-[#1f1f1f] overflow-hidden">
          <table className="min-w-full divide-y divide-[#1f1f1f]">
            <thead className="bg-[#0d0d0d]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#444] tracking-widest">
                  Voluntario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#444] tracking-widest">
                  Email
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-[#444] tracking-widest">
                  Actividades
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-[#444] tracking-widest">
                  Horas
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#111] divide-y divide-[#1f1f1f]">
              {filteredVolunteers.map((volunteer) => (
                <tr
                  key={volunteer.id}
                  className="hover:bg-[#161616] cursor-pointer transition-colors"
                  onClick={() => setSelectedVolunteer(volunteer)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0 border border-[#1f1f1f]">
                        {volunteer.avatar_url ? (
                          <img
                            src={volunteer.avatar_url}
                            alt={volunteer.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#22c55e] flex items-center justify-center text-black font-bold text-sm">
                            {volunteer.full_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{volunteer.full_name}</div>
                        {volunteer.city && (
                          <div className="text-xs text-[#444] mt-0.5">{volunteer.city}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#555]">
                    {volunteer.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-[rgba(34,197,94,0.1)] text-[#22c55e] border border-[rgba(34,197,94,0.2)]">
                      {volunteer.total_activities}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-[rgba(34,197,94,0.08)] text-[#22c55e] border border-[rgba(34,197,94,0.15)]">
                      {volunteer.total_hours}h
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Backdrop */}
      {selectedVolunteer && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setSelectedVolunteer(null)}
        />
      )}

      {/* Drawer panel */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-[#0f0f0f] border-l border-[#1f1f1f] z-50 transform transition-transform duration-300 overflow-y-auto ${
        selectedVolunteer ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {selectedVolunteer && (
          <div className="flex flex-col h-full">

            {/* Header del drawer */}
            <div className="flex items-center justify-between p-5 border-b border-[#1f1f1f]">
              <span className="text-xs text-[#444] tracking-widest">PERFIL DEL VOLUNTARIO</span>
              <button
                onClick={() => setSelectedVolunteer(null)}
                className="w-8 h-8 flex items-center justify-center text-[#444] hover:text-white hover:bg-[#161616] rounded-full transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Avatar y nombre */}
            <div className="flex flex-col items-center py-8 px-5 border-b border-[#1f1f1f]">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#22c55e] mb-4">
                {selectedVolunteer.avatar_url ? (
                  <img
                    src={selectedVolunteer.avatar_url}
                    alt={selectedVolunteer.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#22c55e] flex items-center justify-center text-black font-bold text-3xl">
                    {selectedVolunteer.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <h2 className="text-lg font-bold text-white text-center">
                {selectedVolunteer.full_name}
              </h2>
              {selectedVolunteer.city && (
                <p className="text-[#555] text-sm mt-1 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {selectedVolunteer.city}
                </p>
              )}
              <div className="flex items-center gap-2 mt-3 bg-[#111] border border-[#1f1f1f] rounded-full px-3 py-1.5">
                <div className="w-2 h-2 rounded-full bg-[#22c55e]"></div>
                <span className="text-[#22c55e] text-xs font-medium">{selectedVolunteer.level}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 p-5 border-b border-[#1f1f1f]">
              <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-[#22c55e]">{selectedVolunteer.total_hours}</p>
                <p className="text-[10px] text-[#444] tracking-widest mt-1">HORAS</p>
              </div>
              <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-white">{selectedVolunteer.total_activities}</p>
                <p className="text-[10px] text-[#444] tracking-widest mt-1">ACTIVIDADES</p>
              </div>
            </div>

            {/* Info detallada */}
            <div className="p-5 space-y-5">

              {/* Email */}
              <div>
                <p className="text-[9px] text-[#333] tracking-widest mb-1">EMAIL</p>
                <p className="text-sm text-[#aaa]">{selectedVolunteer.email || '—'}</p>
              </div>

              {/* Bio */}
              {selectedVolunteer.bio && (
                <div>
                  <p className="text-[9px] text-[#333] tracking-widest mb-1">BIOGRAFÍA</p>
                  <p className="text-sm text-[#aaa] leading-relaxed">{selectedVolunteer.bio}</p>
                </div>
              )}

              {/* Habilidades */}
              {selectedVolunteer.skills && selectedVolunteer.skills.length > 0 && (
                <div>
                  <p className="text-[9px] text-[#333] tracking-widest mb-2">HABILIDADES</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedVolunteer.skills.map(skill => (
                      <span
                        key={skill}
                        className="text-xs px-3 py-1 rounded-full bg-[rgba(34,197,94,0.08)] text-[#22c55e] border border-[rgba(34,197,94,0.15)]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Educación */}
              {(selectedVolunteer.university || selectedVolunteer.career) && (
                <div>
                  <p className="text-[9px] text-[#333] tracking-widest mb-1">EDUCACIÓN</p>
                  <p className="text-sm text-[#aaa]">
                    {selectedVolunteer.university}
                    {selectedVolunteer.university && selectedVolunteer.career && (
                      <span className="text-[#333] mx-2">|</span>
                    )}
                    {selectedVolunteer.career}
                  </p>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
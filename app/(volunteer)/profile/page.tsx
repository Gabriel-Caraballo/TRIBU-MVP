// app/(volunteer)/profile/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { AvatarUpload } from '../components/AvatarUpload';

interface VolunteerProfile {
  id: string;
  user_id: string;
  bio: string | null;
  skills: string[] | null;
  university: string | null;
  career: string | null;
  age: number | null;
  city: string | null;
  total_hours: number;
  avatar_url?: string | null;
}

interface SkillHours {
  skill: string;
  hours: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [skillHours, setSkillHours] = useState<SkillHours[]>([]);

  const [newSkill, setNewSkill] = useState('');
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [userName, setUserName] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    bio: '',
    skills: [] as string[],
    university: '',
    career: '',
    age: '',
    city: '',
    avatarUrl: ''
  });
  const [activityCount, setActivityCount] = useState(0);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/auth/login'); return; }

    setUserId(session.user.id);

    const { data: userProfile } = await supabase.from('user_profiles').select('*').eq('id', session.user.id).single();
    const { data: volunteerProfile } = await supabase.from('volunteer_profiles').select('*').eq('user_id', session.user.id).single();

    if (volunteerProfile) {
      const { count } = await supabase.from('activity_participants').select('*', { count: 'exact', head: true }).eq('volunteer_id', volunteerProfile.id);
      setActivityCount(count || 0);
    }

    const { data: attendanceData } = await supabase.from('attendance_logs').select('skill, hours_credited').eq('volunteer_id', session.user.id).gt('hours_credited', 0);
    const hoursMap: Record<string, number> = {};
    attendanceData?.forEach(log => {
      if (log.skill) hoursMap[log.skill] = (hoursMap[log.skill] || 0) + Number(log.hours_credited);
    });
    setSkillHours(Object.entries(hoursMap).map(([skill, hours]) => ({ skill, hours: Math.round(hours * 10) / 10 })).sort((a, b) => b.hours - a.hours).slice(0, 8));

    if (userProfile) {
      setUserName(userProfile.full_name || 'Voluntario');
      setFormData(prev => ({ 
        ...prev, 
        fullName: userProfile.full_name || '', 
        phone: userProfile.phone || '',
        avatarUrl: userProfile.avatar_url || ''
      }));
    }

    if (volunteerProfile) {
      setProfile(volunteerProfile);
      setFormData(prev => ({
        ...prev,
        bio: volunteerProfile.bio || '',
        skills: volunteerProfile.skills || [],
        university: volunteerProfile.university || '',
        career: volunteerProfile.career || '',
        age: volunteerProfile.age?.toString() || '',
        city: volunteerProfile.city || ''
      }));
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await supabase.from('user_profiles').update({ 
        full_name: formData.fullName, 
        phone: formData.phone || null,
        avatar_url: formData.avatarUrl || null 
      }).eq('id', session.user.id);
      await supabase.from('volunteer_profiles').update({
        bio: formData.bio || null,
        skills: formData.skills,
        university: formData.university || null,
        career: formData.career || null,
        age: formData.age ? parseInt(formData.age) : null,
        city: formData.city || null
      }).eq('user_id', session.user.id);

      setMessage({ type: 'success', text: '¡Perfil actualizado!' });
      setEditing(false);
      fetchProfile();
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al guardar.' });
    } finally { setSaving(false); }
  }

  if (loading) return <div className="flex items-center justify-center h-screen bg-[#0a0a0a]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#22c55e]"></div></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 min-h-screen bg-[#0a0a0a] p-4 text-white">

      {/* SECCIÓN 1: IDENTIDAD Y BIO */}
      <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">

          <AvatarUpload
            url={formData.avatarUrl}
            editing={editing}
            userName={userName}
            userId={userId}
            onUpload={(url) => setFormData(prev => ({ ...prev, avatarUrl: url }))}
          />

          <div className="flex-1 w-full space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{formData.fullName || 'Voluntario'}</h1>
                <p className="text-[#22c55e] font-medium mt-1 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                  {formData.city || 'Ciudad no especificada'}
                </p>
              </div>
              <button onClick={() => setEditing(!editing)} className="text-[#22c55e] text-sm font-semibold hover:underline bg-[#22c55e]/10 px-4 py-2 rounded-lg">
                {editing ? 'Cancelar' : 'Editar Perfil'}
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#555] tracking-widest">Biografía</span>
              <p className="text-[#aaa] leading-relaxed">{formData.bio || 'Sin biografía disponible.'}</p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#555] tracking-widest">Habilidades</span>
              <div className="flex flex-wrap gap-2">
                {formData.skills.length > 0 ? formData.skills.map(s => (
                  <span key={s} className="px-3 py-1 rounded-full bg-[#1a1a1a] text-[#22c55e] text-xs border border-[#22c55e]/20">{s}</span>
                )) : <span className="text-sm text-[#333]">Sin habilidades añadidas</span>}
              </div>
            </div>

            {formData.university && (
              <div className="pt-2 border-t border-[#1f1f1f]">
                <span className="text-[10px] uppercase font-bold text-[#555] tracking-widest">Educación</span>
                <p className="text-sm text-white mt-1">{formData.university} {formData.career && <span className="text-[#555]">| {formData.career}</span>}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: FORMULARIO DE EDICIÓN */}

      {editing && (
        <div className="bg-[#111] border border-[#22c55e]/30 rounded-2xl p-8 animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre y Ciudad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#555]">Nombre Completo</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full bg-[#0a0a0a] border border-[#1f1f1f] p-3 rounded-xl focus:ring-2 focus:ring-[#22c55e] outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#555]">Ciudad</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full bg-[#0a0a0a] border border-[#1f1f1f] p-3 rounded-xl focus:ring-2 focus:ring-[#22c55e] outline-none"
                />
              </div>
            </div>

            {/* Biografía */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#555]">Biografía</label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full bg-[#0a0a0a] border border-[#1f1f1f] p-3 rounded-xl focus:ring-2 focus:ring-[#22c55e] outline-none"
              />
            </div>

            {/* Universidad y Carrera */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#555]">Universidad</label>
                <input
                  type="text"
                  value={formData.university}
                  onChange={(e) => setFormData(prev => ({ ...prev, university: e.target.value }))}
                  className="w-full bg-[#0a0a0a] border border-[#1f1f1f] p-3 rounded-xl focus:ring-2 focus:ring-[#22c55e] outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#555]">Carrera</label>
                <input
                  type="text"
                  value={formData.career}
                  onChange={(e) => setFormData(prev => ({ ...prev, career: e.target.value }))}
                  className="w-full bg-[#0a0a0a] border border-[#1f1f1f] p-3 rounded-xl focus:ring-2 focus:ring-[#22c55e] outline-none"
                />
              </div>
            </div>

            {/* Habilidades */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-[#555]">Habilidades</label>

              {/* Habilidades seleccionadas */}
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <span key={skill} className="inline-flex items-center px-3 py-1 rounded-full bg-[#22c55e]/10 text-[#22c55e] text-xs border border-[#22c55e]/20">
                    {skill}
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }))}
                      className="ml-2 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Input para agregar habilidad personalizada */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newSkill && !formData.skills.includes(newSkill)) {
                        setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill] }));
                        setNewSkill('');
                      }
                    }
                  }}
                  placeholder="Escribe una habilidad y presiona Enter"
                  className="flex-1 bg-[#0a0a0a] border border-[#1f1f1f] p-3 rounded-xl focus:ring-2 focus:ring-[#22c55e] outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newSkill && !formData.skills.includes(newSkill)) {
                      setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill] }));
                      setNewSkill('');
                    }
                  }}
                  className="px-4 py-2 bg-[#1a1a1a] border border-[#1f1f1f] rounded-xl text-sm hover:border-[#22c55e] transition-colors"
                >
                  Añadir
                </button>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#22c55e] text-black font-bold px-8 py-3 rounded-xl hover:bg-[#1db054] transition-colors disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      )}


      {/* SECCIÓN 3: MÉTRICAS Y IMPACTO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/my-activities" className="bg-[#111] border border-[#1f1f1f] p-6 rounded-2xl hover:border-[#22c55e] transition-all group">
          <span className="text-[10px] uppercase font-bold text-[#555]">Actividades Realizadas</span>
          <p className="text-4xl font-black mt-2 group-hover:text-[#22c55e] transition-colors">{activityCount}</p>
        </Link>
        <Link href="/wallet" className="bg-[#111] border border-[#1f1f1f] p-6 rounded-2xl hover:border-[#22c55e] transition-all group">
          <span className="text-[10px] uppercase font-bold text-[#555]">Billetera de Horas</span>
          <p className="text-4xl font-black mt-2 group-hover:text-[#22c55e] transition-colors">{profile?.total_hours || 0}<span className="text-lg text-[#333] ml-1">h</span></p>
        </Link>
        <Link href="/certificates" className="bg-[#111] border border-[#1f1f1f] p-6 rounded-2xl hover:border-[#f59e0b] transition-all group">
          <span className="text-[10px] uppercase font-bold text-[#555]">Certificados</span>
          <p className="text-4xl font-black mt-2 text-[#f59e0b] transition-colors">0</p>
        </Link>
      </div>

      {/* SECCIÓN 4: GRÁFICO DE HABILIDADES */}
      {skillHours.length > 0 && (
        <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-8">
          <h2 className="text-lg font-bold mb-6">Distribución de Impacto por Skill</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillHours} layout="vertical" margin={{ left: 60 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="skill" width={70} tick={{ fontSize: 10, fill: '#444' }} />
                <Tooltip contentStyle={{ borderRadius: 12, background: '#111', border: '1px solid #1f1f1f' }} />
                <Bar dataKey="hours" radius={[0, 4, 4, 0]}>
                  {skillHours.map((entry, index) => <Cell key={entry.skill} fill={COLORS[index % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}


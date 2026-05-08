// app/(volunteer)/profile/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie 
} from 'recharts';

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
}

interface SkillHours {
  skill: string;
  hours: number;
}

const COMMON_SKILLS = [
  'Diseño gráfico', 'Fotografía', 'Video edición', 'Redes sociales',
  'Programación', 'Marketing digital', 'Escritura', 'Traducción',
  'Educación', 'Trabajo social', 'Primeros auxilios', 'Cocina',
  'Construcción', 'Jardinería', 'Música', 'Deportes', 'Arte',
  'Comunicación', 'Liderazgo', 'Administración', 'Contabilidad'
];

// Colores para el gráfico
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isNewUser, setIsNewUser] = useState(false);
  const [editing, setEditing] = useState(false);
  const [skillHours, setSkillHours] = useState<SkillHours[]>([]);
  
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
    city: ''
  });
  const [newSkill, setNewSkill] = useState('');

  // Calcular nivel basado en horas
  const getUserLevel = (hours: number): { name: string; color: string; min: number; max: number } => {
    if (hours >= 50) return { name: 'Experto', color: '#8B5CF6', min: 50, max: Infinity };
    if (hours >= 10) return { name: 'Activo', color: '#10B981', min: 10, max: 49 };
    return { name: 'Rookie', color: '#3B82F6', min: 0, max: 9 };
  };

  // Calcular progreso hacia siguiente nivel
  const getLevelProgress = (hours: number): number => {
    const level = getUserLevel(hours);
    if (level.name === 'Experto') return 100;
    const range = level.name === 'Activo' ? 40 : 10;
    const progress = hours - level.min;
    return Math.min(100, Math.round((progress / range) * 100));
  };

  // Obtener siguiente nivel
  const getNextLevel = (hours: number): string => {
    if (hours < 10) return 'Activo (10 horas)';
    if (hours < 50) return 'Experto (50 horas)';
    return '¡Máximo nivel alcanzado!';
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/auth/login');
      return;
    }

    // Get user profile data
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    // Get volunteer profile data
    const { data: volunteerProfile } = await supabase
      .from('volunteer_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    // Get skill hours breakdown
    const { data: attendanceData } = await supabase
      .from('attendance_logs')
      .select('skill, hours_credited')
      .eq('volunteer_id', session.user.id)
      .gt('hours_credited', 0);

    // Aggregate hours by skill
    const hoursMap: Record<string, number> = {};
    attendanceData?.forEach(log => {
      if (log.skill) {
        hoursMap[log.skill] = (hoursMap[log.skill] || 0) + Number(log.hours_credited);
      }
    });

    const aggregatedSkills = Object.entries(hoursMap).map(([skill, hours]) => ({
      skill,
      hours: Math.round(hours * 10) / 10
    })).sort((a, b) => b.hours - a.hours).slice(0, 8);

    setSkillHours(aggregatedSkills);

    if (userProfile) {
      setUserName(userProfile.full_name || 'Voluntario');
      setFormData(prev => ({
        ...prev,
        fullName: userProfile.full_name || '',
        phone: userProfile.phone || ''
      }));
    }

    if (volunteerProfile) {
      setProfile(volunteerProfile);
      
      const isNew = !volunteerProfile.bio && 
                    (!volunteerProfile.skills || volunteerProfile.skills.length === 0) &&
                    !volunteerProfile.university;
      setIsNewUser(isNew);

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
    setMessage({ type: '', text: '' });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await supabase
        .from('user_profiles')
        .update({ 
          full_name: formData.fullName,
          phone: formData.phone || null
        })
        .eq('id', session.user.id);

      await supabase
        .from('volunteer_profiles')
        .update({
          bio: formData.bio || null,
          skills: formData.skills,
          university: formData.university || null,
          career: formData.career || null,
          age: formData.age ? parseInt(formData.age) : null,
          city: formData.city || null
        })
        .eq('user_id', session.user.id);

      setMessage({ type: 'success', text: '¡Perfil guardado correctamente!' });
      setIsNewUser(false);
      setEditing(false);
      await fetchProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'Error al guardar el perfil.' });
    } finally {
      setSaving(false);
    }
  }

  function addSkill(skill: string) {
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
    }
    setNewSkill('');
  }

  function removeSkill(skill: string) {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[--tribu-blue]"></div>
      </div>
    );
  }

  const userLevel = getUserLevel(profile?.total_hours || 0);
  const levelProgress = getLevelProgress(profile?.total_hours || 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header con contador de horas */}
      <div className="bg-gradient-to-r from-[--tribu-blue] to-[--tribu-navy] rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Total de horas acumuladas</p>
            <div className="text-5xl font-bold mt-1">
              {profile?.total_hours || 0}
              <span className="text-xl ml-1 font-normal">hrs</span>
            </div>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-2xl font-bold">{userName.charAt(0)}</span>
            </div>
            <p className="mt-2 text-sm">{userName}</p>
          </div>
        </div>

        {/* Nivel y Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="bg-white/20 px-3 py-1 rounded-full" style={{ backgroundColor: userLevel.color + '40' }}>
              Nivel {userLevel.name}
            </span>
            <span className="text-blue-100">
              {levelProgress}% hacia {getNextLevel(profile?.total_hours || 0)}
            </span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-3 gap-4">
        <Link href="/my-activities" className="bg-white p-4 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-[--tribu-blue]">
            {profile?.total_hours || 0}
          </div>
          <div className="text-xs text-[--tribu-gray]">Mis Actividades</div>
        </Link>
        <Link href="/scan" className="bg-white p-4 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-[--tribu-green]">QR</div>
          <div className="text-xs text-[--tribu-gray]">Escanear</div>
        </Link>
        <Link href="/certificates" className="bg-white p-4 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-[--tribu-orange]">0</div>
          <div className="text-xs text-[--tribu-gray]">Certificados</div>
        </Link>
      </div>

      {/* Gráfico de habilidades */}
      {skillHours.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-[--tribu-navy] mb-4">Horas por Habilidad</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillHours} layout="vertical" margin={{ left: 80 }}>
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="skill" 
                  width={80}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: 8 }}
                  formatter={(value: any) => [`${value} horas`, '']}
                />
                <Bar dataKey="hours" radius={[0, 4, 4, 0]}>
                  {skillHours.map((entry, index) => (
                    <Cell key={entry.skill} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Editar Perfil */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[--tribu-navy]">Mi Perfil</h1>
          <button
            onClick={() => setEditing(!editing)}
            className="text-[--tribu-blue] hover:underline"
          >
            {editing ? 'Cancelar' : 'Editar'}
          </button>
        </div>

        {message.text && (
          <div className={`p-3 rounded-md mb-4 ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
                  Edad
                </label>
                <input
                  type="number"
                  min="13"
                  max="99"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
                Biografía breve
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
                  Universidad
                </label>
                <input
                  type="text"
                  value={formData.university}
                  onChange={(e) => setFormData(prev => ({ ...prev, university: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
                  Carrera
                </label>
                <input
                  type="text"
                  value={formData.career}
                  onChange={(e) => setFormData(prev => ({ ...prev, career: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[--tribu-gray] mb-2">
                Habilidades
              </label>
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.skills.map((skill) => (
                    <span key={skill} className="inline-flex items-center px-3 py-1 rounded-full bg-[--tribu-blue-light] text-[--tribu-blue] text-sm">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="ml-2 hover:text-[--tribu-navy]">×</button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {COMMON_SKILLS.filter(s => !formData.skills.includes(s)).slice(0, 10).map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => addSkill(skill)}
                    className="px-3 py-1 text-sm border border-gray-200 rounded-full hover:border-[--tribu-blue] hover:text-[--tribu-blue]"
                  >
                    + {skill}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(newSkill))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
                  placeholder="Agregar habilidad personalizada"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className={`px-6 py-3 bg-[--tribu-blue] text-white rounded-lg hover:bg-[--tribu-navy] ${
                  saving ? 'opacity-70' : ''
                }`}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-[--tribu-gray]">Nombre</p>
              <p className="font-medium">{formData.fullName || 'No definido'}</p>
            </div>
            <div>
              <p className="text-sm text-[--tribu-gray]">Ciudad</p>
              <p className="font-medium">{formData.city || 'No definido'}</p>
            </div>
            <div>
              <p className="text-sm text-[--tribu-gray]">Biografía</p>
              <p className="font-medium">{formData.bio || 'No definido'}</p>
            </div>
            <div>
              <p className="text-sm text-[--tribu-gray]">Habilidades</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {formData.skills.length > 0 ? formData.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1 rounded-full bg-gray-100 text-sm">{skill}</span>
                )) : <p className="text-gray-400">No definidas</p>}
              </div>
            </div>
            {formData.university && (
              <div>
                <p className="text-sm text-[--tribu-gray]">Universidad</p>
                <p className="font-medium">{formData.university} {formData.career && `- ${formData.career}`}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
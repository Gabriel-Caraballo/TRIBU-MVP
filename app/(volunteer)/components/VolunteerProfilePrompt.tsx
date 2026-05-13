"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AvatarUpload } from './AvatarUpload';

const COMMON_SKILLS = [
  'Diseño gráfico', 'Fotografía', 'Video edición', 'Redes sociales',
  'Programación', 'Marketing digital', 'Escritura', 'Traducción',
  'Educación', 'Trabajo social', 'Primeros auxilios', 'Cocina',
  'Construcción', 'Jardinería', 'Música', 'Deportes', 'Arte',
  'Comunicación', 'Liderazgo', 'Administración', 'Contabilidad'
];

const COMMON_CITIES = [
  'Santo Domingo', 'Santiago', 'La Vega', 'San Cristóbal',
  'La Romana', 'San Pedro de Macorís', 'Puerto Plata',
  'San Francisco de Macorís', 'Barahona', 'Bonao'
];

interface VolunteerProfilePromptProps {
  onComplete?: () => void;
}

export default function VolunteerProfilePrompt({ onComplete }: VolunteerProfilePromptProps) {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [volunteerId, setVolunteerId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');

  const [formData, setFormData] = useState({
    bio: '',
    skills: [] as string[],
    city: '',
    birth_date: '', // Cambiado de age a birth_date
    phone: '',      // Nuevo campo
    university: '',
    career: '',
    avatarUrl: ''
  });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single();

      if (userProfile) setUserName(userProfile.full_name || '');

      const { data: volunteerProfile } = await supabase
        .from('volunteer_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (volunteerProfile) {
        setVolunteerId(volunteerProfile.id);
        setFormData({
          bio: volunteerProfile.bio || '',
          skills: volunteerProfile.skills || [],
          city: volunteerProfile.city || '',
          birth_date: volunteerProfile.birth_date || '', // Mapeo de fecha
          phone: volunteerProfile.phone || '',           // Mapeo de teléfono
          university: volunteerProfile.university || '',
          career: volunteerProfile.career || '',
          avatarUrl: volunteerProfile.avatar_url || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase
        .from('volunteer_profiles')
        .update({
          bio: formData.bio,
          skills: formData.skills,
          city: formData.city,
          birth_date: formData.birth_date || null, // Guardar fecha
          phone: formData.phone || null,           // Guardar teléfono
          university: formData.university || null,
          career: formData.career || null,
          avatar_url: formData.avatarUrl
        })
        .eq('id', volunteerId);

      if (error) throw error;

      setMessage({ type: 'success', text: '¡Perfil guardado correctamente!' });
      if (onComplete) onComplete();
      else window.location.reload();
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'Error al guardar. Intenta de nuevo.' });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[--tribu-blue]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-xl p-8">
      <div className="bg-[--tribu-orange-light] border-l-4 border-[--tribu-orange] p-4 mb-6 rounded-r-lg">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-[--tribu-orange] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="font-bold text-[--tribu-navy]">¡Completa tu perfil!</h3>
            <p className="text-sm text-[--tribu-gray]">Necesitas completar tu información para participar.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center mb-8">
        <AvatarUpload
          url={formData.avatarUrl}
          editing={true}
          userName={userName}
          onUpload={(url) => setFormData(prev => ({ ...prev, avatarUrl: url }))}
        />
        <p className="text-xs text-[--tribu-gray] mt-2">Sube una foto para que te reconozcan</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[--tribu-gray] mb-1">Cuéntanos sobre ti *</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
            placeholder="¿Qué te motiva a ser voluntario?"
          />
        </div>

        {/* Ciudad y Fecha de Nacimiento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[--tribu-gray] mb-1">Ciudad *</label>
            <select
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
            >
              <option value="">Selecciona una ciudad</option>
              {COMMON_CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[--tribu-gray] mb-1">Fecha de nacimiento *</label>
            <input
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
            />
          </div>
        </div>

        {/* Teléfono y Universidad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[--tribu-gray] mb-1">Número de teléfono *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              required
              placeholder="Ej: 809-555-5555"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[--tribu-gray] mb-1">Universidad (Opcional)</label>
            <input
              type="text"
              value={formData.university}
              onChange={(e) => setFormData(prev => ({ ...prev, university: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
              placeholder="¿Dónde estudias?"
            />
          </div>
        </div>

        {/* Habilidades (Resumido para brevedad) */}
        <div>
          <label className="block text-sm font-medium text-[--tribu-gray] mb-2">Habilidades</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.skills.map(skill => (
              <span key={skill} className="bg-[--tribu-blue-light] text-[--tribu-blue] px-3 py-1 rounded-full text-sm flex items-center">
                {skill}
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }))} className="ml-2 font-bold">&times;</button>
              </span>
            ))}
          </div>
          <select
            onChange={(e) => addSkill(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value=""
          >
            <option value="">Agregar habilidad...</option>
            {COMMON_SKILLS.filter(s => !formData.skills.includes(s)).map(skill => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
        </div>

        {message.text && (
          <div className={`p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className={`px-8 py-3 bg-[--tribu-blue] text-white rounded-lg hover:bg-[--tribu-navy] transition-colors font-medium ${saving ? 'opacity-70' : ''}`}
          >
            {saving ? 'Guardando...' : 'Guardar y Continuar'}
          </button>
        </div>
      </form>
    </div>
  );
}


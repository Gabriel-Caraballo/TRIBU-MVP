// app/(volunteer)/components/VolunteerProfilePrompt.tsx
"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const COMMON_SKILLS = [
  'Diseño gráfico', 'Fotografía', 'Video edición', 'Redes sociales',
  'Programación', 'Marketing digital', 'Escritura', 'Traducción',
  'Educación', 'Trabajo social', 'Primeros auxilios', 'Cocina',
  'Construcción', 'Jardinería', 'Música', 'Deportes', 'Arte',
  'Comunicación', 'Liderazgo', 'Administración', 'Contabilidad'
];

const COMMON_CITIES = [
  'Santo Domingo',
  'Santiago',
  'La Vega',
  'San Cristóbal',
  'La Romana',
  'San Pedro de Macorís',
  'Puerto Plata',
  'San Francisco de Macorís',
  'Barahona',
  'Bonao'
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
  
  const [formData, setFormData] = useState({
    bio: '',
    skills: [] as string[],
    city: '',
    age: '',
    university: '',
    career: ''
  });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

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
          age: volunteerProfile.age?.toString() || '',
          university: volunteerProfile.university || '',
          career: volunteerProfile.career || ''
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
          age: formData.age ? parseInt(formData.age) : null,
          university: formData.university || null,
          career: formData.career || null
        })
        .eq('id', volunteerId);

      if (error) throw error;

      setMessage({ type: 'success', text: '¡Perfil guardado correctamente!' });
      
      if (onComplete) {
        onComplete();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'Error al guardar. Intenta de nuevo.' });
    } finally {
      setSaving(false);
    }
  }

  function addSkill(skill: string) {
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
    setNewSkill('');
  }

  function removeSkill(skill: string) {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
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
      {/* Header de alerta */}
      <div className="bg-[--tribu-orange-light] border-l-4 border-[--tribu-orange] p-4 mb-6 rounded-r-lg">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-[--tribu-orange] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="font-bold text-[--tribu-navy]">¡Completa tu perfil!</h3>
            <p className="text-sm text-[--tribu-gray]">
              Necesitas completar tu información para participar en actividades.
            </p>
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-[--tribu-navy] mb-2">Tu Perfil de Voluntario</h1>
      <p className="text-[--tribu-gray] mb-6">
        Esta información ayudará a las organizaciones a conocerte mejor.
      </p>

      {message.text && (
        <div className={`p-3 rounded-md mb-4 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Biografía */}
        <div>
          <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
            Cuéntanos sobre ti *
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
            placeholder="¿Por qué quieres ser voluntario? ¿Qué te motiva?"
          />
        </div>

        {/* Ciudad y Edad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
              Ciudad *
            </label>
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
              placeholder="Tu edad"
            />
          </div>
        </div>

        {/* Universidad y Carrera */}
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
              placeholder="PUCMM, UASD, etc."
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
              placeholder="Ing. Sistemas, Mercadeo, etc."
            />
          </div>
        </div>

        {/* Habilidades */}
        <div>
          <label className="block text-sm font-medium text-[--tribu-gray] mb-2">
            Habilidades *
          </label>
          
          {/* Selected skills */}
          {formData.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.skills.map((skill) => (
                <span 
                  key={skill}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-[--tribu-blue-light] text-[--tribu-blue] text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-2 text-[--tribu-blue] hover:text-[--tribu-navy]"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Add skill from common list */}
          <div className="mb-3">
            <p className="text-sm text-[--tribu-gray] mb-2">Selecciona:</p>
            <div className="flex flex-wrap gap-2">
              {COMMON_SKILLS.filter(s => !formData.skills.includes(s)).slice(0, 12).map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => addSkill(skill)}
                  className="px-3 py-1 text-sm border border-gray-200 rounded-full hover:border-[--tribu-blue] hover:text-[--tribu-blue] transition-colors"
                >
                  + {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Custom skill */}
          <div>
            <p className="text-sm text-[--tribu-gray] mb-1">O agrega otra:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(newSkill))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
                placeholder="Escribe una habilidad y presiona Enter"
              />
              <button
                type="button"
                onClick={() => addSkill(newSkill)}
                className="px-4 py-2 bg-[--tribu-blue] text-white rounded-md hover:bg-[--tribu-navy]"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>

        {/* Botón de guardar */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className={`px-8 py-3 bg-[--tribu-blue] text-white rounded-lg hover:bg-[--tribu-navy] transition-colors font-medium ${
              saving ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {saving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V2C5.373 2 2 5.373 2 12h2zm8 4l-2-2 2-2 2 2-2 2z"></path>
                </svg>
                Guardando...
              </span>
            ) : 'Guardar y Continuar'}
          </button>
        </div>
      </form>
    </div>
  );
}
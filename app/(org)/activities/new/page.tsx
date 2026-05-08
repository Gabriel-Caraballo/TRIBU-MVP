// app/(org)/activities/new/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const COMMON_SKILLS = [
  'Diseño gráfico', 'Fotografía', 'Video edición', 'Redes sociales',
  'Programación', 'Marketing digital', 'Escritura', 'Traducción',
  'Educación', 'Trabajo social', 'Primeros auxilios', 'Cocina',
  'Construcción', 'Jardinería', 'Música', 'Deportes', 'Arte',
  'Comunicación', 'Liderazgo', 'Administración', 'Contabilidad'
];

export default function NewActivityPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    startTime: '',
    endTime: '',
    maxVolunteers: '10',
    skills: [] as string[]
  });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetchOrgId();
  }, []);

  async function fetchOrgId() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      const { data: orgMember } = await supabase
        .from('org_members')
        .select('org_id')
        .eq('user_id', session.user.id)
        .single();

      if (orgMember) {
        setOrgId(orgMember.org_id);
      }
    } catch (error) {
      console.error('Error fetching org:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (!orgId) {
        setMessage({ type: 'error', text: 'No tienes una organización asociada.' });
        setLoading(false);
        return;
      }

      // Combine date and time
      const startTime = new Date(`${formData.date}T${formData.startTime}`).toISOString();
      const endTime = new Date(`${formData.date}T${formData.endTime}`).toISOString();

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('activities')
        .insert({
          org_id: orgId,
          title: formData.title,
          description: formData.description,
          location: formData.location,
          start_time: startTime,
          end_time: endTime,
          max_volunteers: parseInt(formData.maxVolunteers) || 10,
          required_skills: formData.skills,
          status: 'draft', // Start as draft
          created_by: session.user.id
        });

      if (error) throw error;

      setMessage({ type: 'success', text: '¡Actividad creada exitosamente!' });
      
      // Redirect after success
      setTimeout(() => {
        router.push('/activities');
      }, 1500);

    } catch (error: any) {
      console.error('Error creating activity:', error);
      setMessage({ type: 'error', text: error.message || 'Error al crear la actividad.' });
    } finally {
      setLoading(false);
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

  // Get today's date for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-[--tribu-navy] mb-6">Nueva Actividad</h1>

      {message && (
        <div className={`p-3 rounded-md mb-4 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
            Título *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
            placeholder="Ej: Jornada de reforestación"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
            Descripción
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
            placeholder="¿En qué consistirá la actividad?"
          />
        </div>

        {/* Ubicación */}
        <div>
          <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
            Ubicación *
          </label>
          <input
            type="text"
            required
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
            placeholder="Parque Nacional, Centro Comunitario, etc."
          />
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
            Fecha *
          </label>
          <input
            type="date"
            required
            min={today}
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
          />
        </div>

        {/* Horarios */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
              Hora de inicio *
            </label>
            <input
              type="time"
              required
              value={formData.startTime}
              onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
              Hora de fin *
            </label>
            <input
              type="time"
              required
              value={formData.endTime}
              onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
            />
          </div>
        </div>

        {/* Cupo */}
        <div>
          <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
            Máximo de voluntarios
          </label>
          <input
            type="number"
            min="1"
            value={formData.maxVolunteers}
            onChange={(e) => setFormData(prev => ({ ...prev, maxVolunteers: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
          />
        </div>

        {/* Habilidades */}
        <div>
          <label className="block text-sm font-medium text-[--tribu-gray] mb-2">
            Habilidades requeridas
          </label>
          
          {formData.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.skills.map((skill) => (
                <span key={skill} className="inline-flex items-center px-3 py-1 rounded-full bg-[--tribu-blue-light] text-[--tribu-blue] text-sm">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="ml-2 hover:text-[--tribu-navy]">
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 mb-3">
            {COMMON_SKILLS.filter(s => !formData.skills.includes(s)).slice(0, 12).map((skill) => (
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
          
          <div className="flex gap-2">
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

        {/* Submit */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => router.push('/activities')}
            className="px-4 py-2 text-[--tribu-gray] hover:text-[--tribu-navy]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 bg-[--tribu-blue] text-white rounded-lg hover:bg-[--tribu-navy] disabled:opacity-50`}
          >
            {loading ? 'Creando...' : 'Crear como Borrador'}
          </button>
        </div>
      </form>
    </div>
  );
}
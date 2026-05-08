// app/(org)/components/OrgProfilePrompt.tsx
"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const CATEGORIES = [
  'Educación',
  'Medio Ambiente',
  'Salud',
  'Desarrollo Comunitario',
  'Animales',
  'Cultura y Arte',
  'Deportes',
  'Derechos Humanos',
  'Desastres Naturales',
  'Adultos Mayores',
  'Niñez y Juventud',
  'Otro'
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

interface OrgProfilePromptProps {
  onComplete?: () => void;
}

export default function OrgProfilePrompt({ onComplete }: OrgProfilePromptProps) {
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [orgId, setOrgId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    description: '',
    mission: '',
    vision: '',
    phone: '',
    address: '',
    city: '',
    category: '',
    website: ''
  });

  useEffect(() => {
    fetchOrganization();
  }, []);

  async function fetchOrganization() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const { data: orgMember } = await supabase
        .from('org_members')
        .select('org_id')
        .eq('user_id', session.user.id)
        .single();

      if (!orgMember) return;

      setOrgId(orgMember.org_id);

      const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgMember.org_id)
        .single();

      if (org) {
        setFormData({
          description: org.description || '',
          mission: org.mission || '',
          vision: org.vision || '',
          phone: org.phone || '',
          address: org.address || '',
          city: org.city || '',
          category: org.category || '',
          website: org.website || ''
        });
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
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
        .from('organizations')
        .update({
          description: formData.description,
          mission: formData.mission,
          vision: formData.vision,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          category: formData.category,
          website: formData.website || null
        })
        .eq('id', orgId);

      if (error) throw error;

      setMessage({ type: 'success', text: '¡Perfil guardado correctamente!' });
      
      if (onComplete) {
        onComplete();
      } else {
        // Recargar la página para verificar el perfil
        window.location.reload();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'Error al guardar. Intenta de nuevo.' });
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
              Necesitas completar toda la información de tu organización antes de continuar.
            </p>
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-[--tribu-navy] mb-2">Perfil de tu Organización</h1>
      <p className="text-[--tribu-gray] mb-6">
        Esta información será visible para los voluntarios en el feed de actividades.
      </p>

      {message.text && (
        <div className={`p-3 rounded-md mb-4 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
            Descripción de tu organización *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
            placeholder="¿Qué hace tu organización? ¿Cuál es tu focus principal?"
          />
        </div>

        {/* Misión y Visión */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
              Misión *
            </label>
            <textarea
              name="mission"
              value={formData.mission}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
              placeholder="¿Cuál es tu misión?"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
              Visión
            </label>
            <textarea
              name="vision"
              value={formData.vision}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
              placeholder="¿Cuál es tu visión a futuro?"
            />
          </div>
        </div>

        {/* Información de contacto */}
        <div>
          <h2 className="text-lg font-semibold text-[--tribu-navy] mb-4">Información de Contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
                Teléfono *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
                placeholder="+1 (809) 000-0000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
                Sitio web
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
                placeholder="https://tuorganizacion.org"
              />
            </div>
          </div>
        </div>

        {/* Dirección y Ciudad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
              Dirección *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
              placeholder="Calle, número, sector"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
              Ciudad *
            </label>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
            >
              <option value="">Selecciona una ciudad</option>
              {COMMON_CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
            Categoría *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
          >
            <option value="">Selecciona una categoría</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
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
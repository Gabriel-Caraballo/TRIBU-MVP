// app/(org)/organization/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Organization {
  id: string;
  name: string;
  description: string | null;
  mission: string | null;
  vision: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  category: string | null;
  website: string | null;
  contact_email: string | null;
  logo_url: string | null;
  founded_year: number | null;
}

const CATEGORIES = [
  'Educación', 'Salud', 'Medio Ambiente', 'Derechos Humanos',
  'Animales', 'Desarrollo Comunitario', 'Cultura', 'Deportes',
  'Emergencias', 'Otro'
];

const CITIES = [
  'Santo Domingo', 'Santiago', 'La Altagracia', 'La Romana',
  'San Cristóbal', 'Duarte', 'La Vega', 'Puerto Plata',
  'Espaillat', 'San Pedro de Macorís', 'Otra'
];

export default function OrganizationPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    mission: '',
    vision: '',
    phone: '',
    address: '',
    city: '',
    category: '',
    website: '',
    contact_email: '',
    founded_year: ''
  });

  useEffect(() => {
    fetchOrganization();
  }, []);

  async function fetchOrganization() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: orgMember } = await supabase
        .from('org_members')
        .select('org_id')
        .eq('user_id', session.user.id)
        .single();

      if (!orgMember) {
        setLoading(false);
        return;
      }

      const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgMember.org_id)
        .single();

      if (org) {
        setOrganization(org);
        setFormData({
          name: org.name || '',
          description: org.description || '',
          mission: org.mission || '',
          vision: org.vision || '',
          phone: org.phone || '',
          address: org.address || '',
          city: org.city || '',
          category: org.category || '',
          website: org.website || '',
          contact_email: org.contact_email || '',
          founded_year: org.founded_year?.toString() || ''
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
    setMessage(null);

    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: formData.name,
          description: formData.description || null,
          mission: formData.mission || null,
          vision: formData.vision || null,
          phone: formData.phone || null,
          address: formData.address || null,
          city: formData.city || null,
          category: formData.category || null,
          website: formData.website || null,
          contact_email: formData.contact_email || null,
          founded_year: formData.founded_year ? parseInt(formData.founded_year) : null
        })
        .eq('id', organization?.id);

      if (error) throw error;

      setMessage({ type: 'success', text: '¡Perfil guardado correctamente!' });
    } catch (error) {
      console.error('Error saving:', error);
      setMessage({ type: 'error', text: 'Error al guardar el perfil.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[--tribu-blue]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-[--tribu-navy] mb-6">Perfil de la Organización</h1>

      {message && (
        <div className={`p-4 rounded-lg mb-4 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-[--tribu-navy] mb-4">Información básica</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
                Nombre de la organización *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
                Categoría
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
              >
                <option value="">Seleccionar categoría</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
                Ciudad
              </label>
              <select
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
              >
                <option value="">Seleccionar ciudad</option>
                {CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-[--tribu-navy] mb-4">Misión y Visión</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
                Misión
              </label>
              <textarea
                value={formData.mission}
                onChange={(e) => setFormData(prev => ({ ...prev, mission: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
                Visión
              </label>
              <textarea
                value={formData.vision}
                onChange={(e) => setFormData(prev => ({ ...prev, vision: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-[--tribu-navy] mb-4">Contacto</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                Email de contacto
              </label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
                Dirección
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--tribu-blue]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[--tribu-gray] mb-1">
                Año de fundación
              </label>
              <input
                type="number"
                min="1900"
                max="2030"
                value={formData.founded_year}
                onChange={(e) => setFormData(prev => ({ ...prev, founded_year: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[-tribu-blue]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className={`px-6 py-3 bg-[--tribu-blue] text-white rounded-lg font-semibold hover:bg-[--tribu-navy] disabled:opacity-50`}
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
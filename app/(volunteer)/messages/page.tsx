// app/(volunteer)/messages/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function MessagesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
      } else {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[--tribu-blue]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[--tribu-light] pb-20">
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold text-[--tribu-navy] mb-6">Mensajes</h1>
        
        <div className="text-center py-12">
          <div className="text-5xl mb-4">💬</div>
          <h2 className="text-xl font-semibold text-[--tribu-navy] mb-2">Aún no hay mensajes</h2>
          <p className="text-[--tribu-gray]">
            Aquí podrás chatear con otros voluntarios y coordinar trueques de actividades.
          </p>
        </div>

        <div className="mt-8 p-4 bg-white rounded-lg shadow-sm">
          <h3 className="font-semibold text-[--tribu-navy] mb-2">Próximamente</h3>
          <ul className="text-sm text-[--tribu-gray] space-y-2">
            <li>✨ Chats directos con otros voluntarios</li>
            <li>🤝 Trueques de horarios entre voluntarios</li>
            <li>📢 Notificaciones de la comunidad</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
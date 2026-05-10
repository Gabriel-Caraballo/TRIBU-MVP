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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#22c55e]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold text-white mb-6">Mensajes</h1>
        
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-white mb-2">Aún no hay mensajes</h2>
          <p className="text-[#555]">
            Aquí podrás chatear con otros voluntarios y coordinar trueques de actividades.
          </p>
        </div>

        <div className="mt-8 p-4 bg-[#111] rounded-lg border border-[#1f1f1f]">
          <h3 className="font-semibold text-white mb-2">Próximamente</h3>
          <ul className="text-sm text-[#555] space-y-2">
            <li>— Chats directos con otros voluntarios</li>
            <li>— Trueques de horarios entre voluntarios</li>
            <li>— Notificaciones de la comunidad</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
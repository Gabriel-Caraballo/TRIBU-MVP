// app/(volunteer)/components/AvatarUpload.tsx
import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface AvatarUploadProps {
    url: string | null;
    onUpload: (url: string) => void;
    editing: boolean;
    userName?: string;
    userId?: string;
}

export function AvatarUpload({ url, onUpload, editing, userName, userId }: AvatarUploadProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        try {
            if (!e.target.files || e.target.files.length === 0) return;
            if (!userId) {
                alert('Error: usuario no identificado');
                return;
            }

            setUploading(true);
            const file = e.target.files[0];
            const filePath = `${userId}/avatar`;

            // Subida a Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            onUpload(publicUrl);
        } catch (error) {
            console.error('Error subiendo imagen:', error);
            alert('Error al subir la imagen');
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="relative group mx-auto md:mx-0">
            <div className={`w-32 h-32 rounded-2xl overflow-hidden bg-[#1a1a1a] border-2 ${uploading ? 'border-yellow-500' : 'border-[#22c55e]'} flex items-center justify-center shadow-xl`}>
                {url ? (
                    <img
                        src={url}
                        alt="Avatar"
                        className={`w-full h-full object-cover transition-opacity ${uploading ? 'opacity-40' : 'opacity-100'}`}
                    />
                ) : (
                    <span className="text-4xl font-bold text-[#22c55e]">
                        {/* Muestra la inicial del nombre o 'V' por defecto */}
                        {userName ? userName.charAt(0).toUpperCase() : 'V'}
                    </span>
                )}

                {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
                    </div>
                )}
            </div>

            {editing && !uploading && (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 bg-[#22c55e] p-2 rounded-lg text-black hover:scale-110 transition-transform shadow-lg"
                    title="Cambiar foto"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                    </svg>
                </button>
            )}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                className="hidden"
                accept="image/*"
                disabled={uploading}
            />
        </div>
    );
}

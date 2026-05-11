// app/components/auth/AuthCard.tsx
// app/components/auth/AuthCard.tsx
import Image from 'next/image';

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
}

export default function AuthCard({ children, title }: AuthCardProps) {
  return (
    <div className="min-h-screen bg-[#060606] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

      {/* Auras de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[--tribu-green]/10 blur-[130px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[--tribu-blue]/10 blur-[130px] rounded-full" />

      <div className="w-full max-w-md z-10">
        {/* Card con efecto Glassmorphism TOTAL */}
        <div className="bg-[#111111]/40 backdrop-blur-2xl border border-white/10 py-10 px-8 shadow-2xl rounded-[2rem]">

          {/* Header DENTRO del Card */}
          <div className="flex flex-col items-center mb-8">
            {/* Logo Circular con Marco */}
            <div className="w-24 h-24 relative mb-6 rounded-full border border-white/10 bg-white p-3 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="TRIBU Logo"
                  fill
                  className="object-contain p-1"
                  sizes="96px"
                  priority
                />
              </div>
            </div>

            <h2 className="text-center text-2xl font-light tracking-[0.2em] text-white uppercase italic">
              {title}
            </h2>
            <div className="h-[2px] w-8 bg-[--tribu-green] mt-3 rounded-full shadow-[0_0_10px_var(--tribu-green)]"></div>
          </div>

          {/* Contenido del Formulario */}
          <div className="space-y-2">
            {children}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-[10px] text-white/20 tracking-[0.3em] uppercase font-medium">
          FireforgeRD &copy; {new Date().getFullYear()} — Sistemas de Élite
        </p>
      </div>
    </div>
  );
}

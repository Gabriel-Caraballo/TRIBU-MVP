// app/components/auth/AuthCard.tsx
import Image from 'next/image';

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
}

export default function AuthCard({ children, title }: AuthCardProps) {
  return (
    <div className="min-h-screen bg-[--tribu-light] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 relative mb-4">
            <Image 
              src="/logo.png" 
              alt="TRIBU Logo" 
              fill
              className="object-contain"
              sizes="64px"
            />
          </div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-[--tribu-navy]">
            {title}
          </h2>
        </div>
        <div className="bg-white py-8 px-6 shadow-md rounded-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
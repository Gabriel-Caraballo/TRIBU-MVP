// app/components/auth/AccountTypeSelector.tsx
"use client";

interface AccountType {
  id: 'org_admin' | 'volunteer';
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface AccountTypeSelectorProps {
  onSelect: (type: 'org_admin' | 'volunteer') => void;
  selected?: 'org_admin' | 'volunteer';
}

export default function AccountTypeSelector({ onSelect, selected }: AccountTypeSelectorProps) {
  const accountTypes: AccountType[] = [
    {
      id: 'volunteer',
      title: 'Voluntario',
      description: 'Encuentra causas y construye tu CV social',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      id: 'org_admin',
      title: 'Organización',
      description: 'Gestiona equipos y mide tu impacto real',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18M3 7v1a3 3 0 006 0V4m0 3a3 3 0 006 0V4m0 3a3 3 0 006 0V4M4 21h16V10H4v11z" />
        </svg>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 my-8">
      {accountTypes.map((type) => {
        const isSelected = selected === type.id;

        return (
          <div
            key={type.id}
            onClick={() => onSelect(type.id)}
            className={`
              group relative flex items-center p-5 cursor-pointer rounded-2xl transition-all duration-300
              border border-white/5 bg-white/[0.02] hover:bg-white/[0.05]
              ${isSelected ? 'ring-1 ring-[--tribu-green] border-[--tribu-green]/30 bg-white/[0.07]' : ''}
            `}
          >
            {/* Indicador de selección */}
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
              ${isSelected
                ? 'bg-[--tribu-green] text-black shadow-[0_0_15px_rgba(var(--tribu-green-rgb),0.3)]'
                : 'bg-white/5 text-white/40 group-hover:text-white/60'}
            `}>
              {type.icon}
            </div>

            <div className="ml-4 flex-1">
              <h3 className={`text-xs font-black uppercase tracking-[0.15em] transition-colors ${isSelected ? 'text-white' : 'text-white/60'}`}>
                {type.title}
              </h3>
              <p className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5 leading-relaxed">
                {type.description}
              </p>
            </div>

            {/* Checkmark visual para selección */}
            {isSelected && (
              <div className="absolute right-5 animate-in zoom-in duration-300">
                <div className="w-2 h-2 rounded-full bg-[--tribu-green] shadow-[0_0_8px_var(--tribu-green)]" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

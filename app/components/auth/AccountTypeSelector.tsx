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
      id: 'org_admin',
      title: 'Soy una ONG / Organización',
      description: 'Gestiona voluntarios y mide tu impacto',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: 'volunteer',
      title: 'Soy voluntario',
      description: 'Encuentra causas y construye tu CV',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
      {accountTypes.map((type) => (
        <div
          key={type.id}
          className={`border-2 rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
            selected === type.id 
              ? 'border-[--tribu-blue] bg-[--tribu-blue-light]/20' 
              : 'border-gray-200 hover:border-[--tribu-blue]/30'
          }`}
          onClick={() => onSelect(type.id)}
        >
          <div className="flex items-center mb-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              selected === type.id 
                ? 'bg-[--tribu-blue] text-white' 
                : 'bg-[--tribu-blue-light] text-[--tribu-blue]'
            }`}>
              {type.icon}
            </div>
            <h3 className="ml-3 font-semibold text-[--tribu-navy]">{type.title}</h3>
          </div>
          <p className="text-[--tribu-gray] text-sm ml-13">{type.description}</p>
        </div>
      ))}
    </div>
  );
}
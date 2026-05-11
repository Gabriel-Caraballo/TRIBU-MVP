// app/components/auth/FormField.tsx
import { useState } from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  className?: string;
  autoComplete?: string;
}

export default function FormField({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  error,
  onChange,
  required = false,
  className = '',
  autoComplete,
}: FormFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`${className}`}>
      <label
        htmlFor={id}
        className={`block text-[11px] uppercase tracking-[0.1em] font-bold mb-1.5 transition-colors ${isFocused ? 'text-[--tribu-green]' : 'text-white/40'
          }`}
      >
        {label} {required && <span className="text-red-500/80">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={`
            appearance-none block w-full px-4 py-3 
            bg-white/5 border rounded-xl transition-all duration-300
            text-white placeholder:text-white/10 text-sm
            focus:outline-none focus:bg-white/[0.08]
            ${error
              ? 'border-red-500/50 focus:border-red-500'
              : isFocused
                ? 'border-[--tribu-green]/50 ring-1 ring-[--tribu-green]/20'
                : 'border-white/10'
            }
            /* SOLUCIÓN PARA AUTOFILL */
            [&:-webkit-autofill]:[-webkit-text-fill-color:white]
            [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#121212_inset]
            [&:-webkit-autofill]:transition-colors
          `}
        />
        {error && (
          <p className="mt-1.5 text-[10px] text-red-400 font-mono uppercase tracking-tight">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

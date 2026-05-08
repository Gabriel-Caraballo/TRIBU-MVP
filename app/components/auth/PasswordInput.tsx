// app/components/auth/PasswordInput.tsx
"use client";

import { useState } from 'react';
import FormField from './FormField';

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export default function PasswordInput({
  id,
  label,
  value,
  error,
  onChange,
  required = false,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative">
      <FormField
        id={id}
        label={label}
        type={showPassword ? 'text' : 'password'}
        value={value}
        error={error}
        onChange={onChange}
        required={required}
      />
      <button
        type="button"
        onClick={togglePassword}
        className="absolute right-3 top-[35px] text-[--tribu-gray] hover:text-[--tribu-blue] transition-colors text-sm"
      >
        {showPassword ? 'Ocultar' : 'Mostrar'}
      </button>
    </div>
  );
}
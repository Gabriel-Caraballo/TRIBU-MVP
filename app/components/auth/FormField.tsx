// app/components/auth/FormField.tsx
import { useState, useEffect } from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
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
}: FormFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(false);

  useEffect(() => {
    setIsFilled(value.length > 0);
  }, [value]);

  return (
    <div className="mb-4">
      <label 
        htmlFor={id} 
        className={`block text-sm font-medium ${isFocused ? 'text-[--tribu-blue]' : 'text-[--tribu-gray]'} transition-colors`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="mt-1 relative">
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`appearance-none block w-full px-3 py-3 border ${error ? 'border-red-500' : isFocused ? 'border-[--tribu-blue]' : 'border-gray-300'} 
          rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[--tribu-blue] focus:border-[--tribu-blue] transition-colors`}
          placeholder={placeholder}
          aria-describedby={`${id}-error`}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600" id={`${id}-error`}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
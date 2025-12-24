import React from 'react';

interface InputProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  name?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
  name
}) => {
  const inputStyles = 'w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed';
  const labelStyles = 'block text-sm font-medium text-gray-700 mb-1';
  const errorStyles = 'text-red-600 text-sm mt-1';

  return (
    <div className="mb-4">
      <label htmlFor={name} className={labelStyles}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="mt-1">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`${inputStyles} ${className}`}
        />
        {error && (
          <div className={errorStyles}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Input;

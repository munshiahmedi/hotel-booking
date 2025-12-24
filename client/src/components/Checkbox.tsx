import React from 'react';

interface CheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  name?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked = false,
  onChange,
  disabled = false,
  className = '',
  name
}) => {
  const checkboxStyles = 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:cursor-not-allowed';
  const labelStyles = 'ml-2 block text-sm text-gray-900';

  return (
    <div className="flex items-center">
      <input
        id={name}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={`${checkboxStyles} ${className}`}
      />
      <label htmlFor={name} className={labelStyles}>
        {label}
      </label>
    </div>
  );
};

export default Checkbox;

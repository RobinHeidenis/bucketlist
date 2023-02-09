import type { DetailedHTMLProps, InputHTMLAttributes } from 'react';

interface TextInputProps {
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  inputClassName?: string;
  className?: string;
  defaultValue?: string;
}

export const TextInput = ({
  label,
  placeholder,
  required,
  error,
  inputClassName,
  className,
  defaultValue,
  ...props
}: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> &
  TextInputProps) => {
  return (
    <div className={`form-control w-full ${className ?? ''}`}>
      {label && (
        <label className="label">
          <span className="label-text">
            {label} {required && <span className="text-red-500">*</span>}
          </span>
        </label>
      )}
      <input
        type="text"
        placeholder={placeholder}
        className={`input-bordered input w-full ${error ? 'input-error' : ''} ${
          inputClassName ?? ''
        }`}
        defaultValue={defaultValue}
        autoFocus
        {...props}
      />
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
};

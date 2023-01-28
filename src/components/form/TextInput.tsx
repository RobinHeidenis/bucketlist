interface TextInputProps {
  label: string;
  placeholder: string;
  required?: boolean;
  error?: string;
}

export const TextInput = ({
  label,
  placeholder,
  required,
  error,
  ...props
}: TextInputProps) => {
  return (
    <div className="form-control mt-3 w-full max-w-xs">
      <label className="label">
        <span className="label-text">
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      </label>
      <input
        type="text"
        placeholder={placeholder}
        className={`input-bordered input w-full max-w-xs ${
          error ? 'input-error' : ''
        }`}
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

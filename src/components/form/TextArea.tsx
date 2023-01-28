interface TextInputProps {
  label: string;
  placeholder: string;
  required?: boolean;
  error?: string;
}

export const TextArea = ({
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
      <textarea
        placeholder={placeholder}
        className={`input-bordered input h-40 w-full max-w-xs resize-none p-2 ${
          error && 'input-error'
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

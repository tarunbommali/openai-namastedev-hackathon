import React, { forwardRef } from "react";

export const Input = forwardRef(({
  label,
  error,
  hint,
  icon = null,
  iconPosition = "left",
  className = "",
  required = false,
  fullWidth = true,
  ...props
}, ref) => {
  const padClass = icon
    ? iconPosition === "left" ? "pl-9" : "pr-9"
    : "";
  const borderClass = error
    ? "border-rose-300 focus:ring-rose-500"
    : "border-slate-200 focus:ring-indigo-500";

  return (
    <div className={`${fullWidth ? "w-full" : ""} space-y-1`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === "left" && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">{icon}</span>
        )}
        <input
          ref={ref}
          className={`w-full text-sm p-2.5 bg-slate-50 border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${borderClass} ${padClass} ${className}`}
          {...props}
        />
        {icon && iconPosition === "right" && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">{icon}</span>
        )}
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
});

Input.displayName = "Input";

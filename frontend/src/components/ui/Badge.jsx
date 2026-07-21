import React from "react";

const VARIANTS = {
  default: "bg-slate-100 text-slate-700 border-slate-200",
  primary: "bg-indigo-100 text-indigo-700 border-indigo-200",
  success: "bg-emerald-100 text-emerald-700 border-emerald-200",
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  danger:  "bg-rose-100 text-rose-700 border-rose-200",
  info:    "bg-blue-100 text-blue-700 border-blue-200",
};

const DOT_COLORS = {
  default: "bg-slate-500",
  primary: "bg-indigo-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger:  "bg-rose-500",
  info:    "bg-blue-500",
};

const SIZES = {
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

export const Badge = ({
  children,
  variant = "default",
  size = "md",
  className = "",
  icon = null,
  dot = false,
}) => (
  <span className={[
    "inline-flex items-center gap-1.5 font-semibold rounded-full border",
    VARIANTS[variant] ?? VARIANTS.default,
    SIZES[size] ?? SIZES.md,
    className,
  ].join(" ")}>
    {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOT_COLORS[variant] ?? DOT_COLORS.default}`} />}
    {icon && <span className="shrink-0">{icon}</span>}
    {children}
  </span>
);

import React from "react";

const VARIANTS = {
  default: "bg-white border-slate-200",
  primary: "bg-indigo-50 border-indigo-100",
  success: "bg-emerald-50 border-emerald-100",
  warning: "bg-amber-50 border-amber-100",
  danger:  "bg-rose-50 border-rose-100",
};

const PADDING = {
  none:   "p-0",
  small:  "p-3",
  normal: "p-6",
  large:  "p-8",
};

export const Card = ({
  children,
  className = "",
  variant = "default",
  padding = "normal",
  hoverable = false,
}) => (
  <div className={[
    "rounded-xl border shadow-sm",
    VARIANTS[variant] ?? VARIANTS.default,
    PADDING[padding] ?? PADDING.normal,
    hoverable ? "hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer" : "",
    className,
  ].join(" ")}>
    {children}
  </div>
);

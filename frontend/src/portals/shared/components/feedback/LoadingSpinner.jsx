import React from "react";

export function LoadingSpinner({ size = "md", className = "" }) {
  const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10" };
  return (
    <div className={`${sizes[size] || sizes.md} border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin ${className}`} />
  );
}

export function PageLoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-20">
      <LoadingSpinner size="lg" />
    </div>
  );
}

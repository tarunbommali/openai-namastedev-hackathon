import React from "react";

export default function PageContainer({ children, className = "" }) {
  return (
    <div className={`w-full min-h-full px-4 md:px-6 lg:px-8 xl:px-10 py-6 ${className}`}>
      {children}
    </div>
  );
}

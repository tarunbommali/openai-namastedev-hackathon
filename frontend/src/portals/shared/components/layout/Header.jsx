import React from "react";

export function Header({ pageTitle, portalLabel, headerActions }) {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-30 shrink-0">
      <div>
        {portalLabel && (
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{portalLabel}</div>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{pageTitle}</h1>
      </div>
      {headerActions && <div className="flex items-center gap-3">{headerActions}</div>}
    </header>
  );
}

import React from "react";

/**
 * PortalLayout — full-screen shell for all portals.
 * Composes Sidebar + Header + main scrollable area with Outlet slot.
 */
export function PortalLayout({ sidebar, header, breadcrumb, children }) {
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-600 antialiased overflow-hidden">
      {sidebar}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {header}
        <div className="flex-1 overflow-y-auto">
          {breadcrumb && (
            <div className="px-8 pt-4">{breadcrumb}</div>
          )}
          <div className="px-8 py-6 space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

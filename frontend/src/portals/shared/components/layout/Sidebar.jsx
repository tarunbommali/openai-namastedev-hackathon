import React from "react";
import { LogOut } from "lucide-react";

export function Sidebar({ navItems, activePage, onNavigate, user, onLogout, brandName, brandTagline, brandInitial }) {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 shrink-0">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-indigo-600/30 shrink-0">
            {brandInitial || brandName?.[0] || "H"}
          </div>
          <div className="overflow-hidden">
            <div className="font-bold text-white text-base leading-snug truncate max-w-[130px]" title={brandName}>
              {brandName || "HireFlow"}
            </div>
            <div className="text-xs text-indigo-400 font-medium truncate max-w-[130px]" title={brandTagline}>
              {brandTagline || "Portal"}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800">
        {user && (
          <div className="px-3 py-2 text-xs text-slate-400 font-mono mb-2 truncate">
            <span className="text-white font-bold">{user.name}</span>
          </div>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

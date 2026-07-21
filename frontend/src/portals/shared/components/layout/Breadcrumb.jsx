import React from "react";
import { ChevronRight, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

/**
 * Breadcrumb — renders `Home > Section > Page` trail.
 * items: Array<{ label: string, path?: string }>
 * Last item is always non-clickable (current page).
 */
export function Breadcrumb({ items = [], homeHref = "/" }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-xs text-slate-500 font-medium py-1">
      <Link to={homeHref} className="hover:text-indigo-600 transition-colors flex items-center gap-1">
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            {isLast || !item.path ? (
              <span className="text-slate-900 font-semibold truncate max-w-[200px]">{item.label}</span>
            ) : (
              <Link to={item.path} className="hover:text-indigo-600 transition-colors truncate max-w-[200px]">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

import React from "react";
import { useToast } from "../providers/ToastProvider";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

const TOAST_STYLES = {
  success: { bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle2, iconCls: "text-emerald-600", text: "text-emerald-900" },
  error:   { bg: "bg-rose-50 border-rose-200",       icon: XCircle,       iconCls: "text-rose-600",    text: "text-rose-900" },
  warning: { bg: "bg-amber-50 border-amber-200",     icon: AlertTriangle,  iconCls: "text-amber-600",   text: "text-amber-900" },
  info:    { bg: "bg-blue-50 border-blue-200",        icon: Info,           iconCls: "text-blue-600",    text: "text-blue-900" },
};

function Toast({ toast, onRemove }) {
  const style = TOAST_STYLES[toast.type] ?? TOAST_STYLES.info;
  const Icon = style.icon;
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-md min-w-[280px] max-w-sm ${style.bg} animate-fadeInUp`}>
      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${style.iconCls}`} />
      <p className={`flex-1 text-xs font-semibold ${style.text}`}>{toast.message}</p>
      <button onClick={() => onRemove(toast.id)} className="text-slate-400 hover:text-slate-700 transition-colors ml-1">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/**
 * Toaster — renders global toast notifications in the bottom-right corner.
 * Must be a child of ToastProvider.
 */
export function Toaster() {
  const { toasts, removeToast } = useToast();
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <Toast toast={t} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
}

import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info
};
const STYLES = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  error: "bg-rose-50 border-rose-200 text-rose-800",
  info: "bg-indigo-50 border-indigo-200 text-indigo-800"
};

export function Toast({ id, message, type = "info", onRemove }) {
  const Icon = ICONS[type] || Info;
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg text-xs font-semibold max-w-sm pointer-events-auto ${STYLES[type]}`}>
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <span className="flex-1">{message}</span>
      <button onClick={() => onRemove(id)} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts = [], onRemove }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onRemove={onRemove} />
      ))}
    </div>
  );
}

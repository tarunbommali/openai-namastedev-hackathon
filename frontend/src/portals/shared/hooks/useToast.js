import { useState, useCallback } from "react";

let toastId = 0;

/**
 * useToast — provides toast notification state.
 * Usage:
 *   const { toasts, addToast, removeToast } = useToast();
 *   addToast("Saved!", "success");   // type: 'success' | 'error' | 'info'
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

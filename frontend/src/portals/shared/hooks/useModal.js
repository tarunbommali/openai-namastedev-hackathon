import { useState, useCallback } from "react";

/**
 * useModal — lightweight modal open/close state with optional payload.
 * Usage:
 *   const { isOpen, payload, open, close } = useModal();
 *   open({ candidateId: "abc" });
 *   close();
 */
export function useModal(defaultOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [payload, setPayload] = useState(null);

  const open = useCallback((data = null) => {
    setPayload(data);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setPayload(null);
  }, []);

  return { isOpen, payload, open, close };
}

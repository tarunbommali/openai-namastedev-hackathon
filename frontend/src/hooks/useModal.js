import { useState, useCallback } from "react";

/**
 * useModal — open/close + optional payload for modals.
 * @param {boolean} [initialState=false]
 */
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [data, setData] = useState(null);

  const open = useCallback((payload = null) => {
    setData(payload);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      if (prev) setData(null);
      return !prev;
    });
  }, []);

  return { isOpen, data, open, close, toggle };
};

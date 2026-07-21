import { useState, useEffect } from "react";

/**
 * useDebounce — delays updating a value until after the specified delay.
 * @param {any} value
 * @param {number} [delay=500]
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

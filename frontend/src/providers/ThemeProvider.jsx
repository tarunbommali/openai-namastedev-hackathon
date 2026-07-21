import React, { createContext, useContext } from "react";

const ThemeContext = createContext({ theme: "light" });
export const useTheme = () => useContext(ThemeContext);

/**
 * ThemeProvider — placeholder for future dark/light mode.
 * Currently sets theme="light" globally and no-ops on toggle.
 */
export const ThemeProvider = ({ children }) => (
  <ThemeContext.Provider value={{ theme: "light" }}>
    {children}
  </ThemeContext.Provider>
);

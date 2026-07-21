import React from "react";
import { ThemeProvider } from "./ThemeProvider";
import { ToastProvider } from "./ToastProvider";
import { QueryProvider } from "./QueryProvider";
import { AuthProvider } from "./AuthProvider";

/**
 * AppProvider — composes all global providers in correct dependency order:
 * ThemeProvider > ToastProvider > QueryProvider > AuthProvider
 */
export const AppProvider = ({ children }) => (
  <ThemeProvider>
    <ToastProvider>
      <QueryProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </QueryProvider>
    </ToastProvider>
  </ThemeProvider>
);

import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./providers/AppProvider";
import { AppRoutes } from "./routes/AppRoutes";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Toaster } from "./components/Toaster";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <Toaster />
          <AppRoutes />
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

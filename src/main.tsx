import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PerformanceMonitor } from "./utils/performanceMonitor";
import { validateEnvironmentWarn } from "./utils/envValidation";
import { setContentSecurityPolicy } from "./utils/csp";
import { loadAnalytics } from "./utils/analyticsLoader";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./contexts/AuthContext";
import "./index.css";

validateEnvironmentWarn();

// Preconnect to Supabase for faster audio/image loading
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
if (supabaseUrl && supabaseUrl.startsWith('https://')) {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = new URL(supabaseUrl).origin;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}

if (import.meta.env.PROD) {
  setContentSecurityPolicy();
  loadAnalytics();
}

PerformanceMonitor.measurePageLoad();

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);
  
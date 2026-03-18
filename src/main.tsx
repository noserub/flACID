  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import { ErrorBoundary } from "./components/ErrorBoundary";
  import { PerformanceMonitor } from "./utils/performanceMonitor";
  import { validateEnvironmentWarn } from "./utils/envValidation";
  import { setContentSecurityPolicy } from "./utils/csp";
  import { loadAnalytics } from "./utils/analyticsLoader";
  import "./index.css";

  validateEnvironmentWarn();

  if (import.meta.env.PROD) {
    setContentSecurityPolicy();
    loadAnalytics();
  }

  PerformanceMonitor.measurePageLoad();

  createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  
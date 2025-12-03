import { RouterProvider } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/auth";
import { queryClient } from "./lib/query-client";
import ReactDOM from "react-dom/client";
import router from "./router";

/**
 * Componente interno que fornece auth ao router
 * Isso é necessário porque hooks só funcionam dentro de componentes React
 */
function InnerApp() {
  const auth = useAuth();

  if (!auth.authIsRetrieved) {
    return <div>Carregando...</div>;
  }
  return <RouterProvider router={router} context={{ auth }} />;
}

/**
 * Componente principal que envolve tudo com QueryClient e AuthProvider
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <InnerApp />
      </AuthProvider>
    </QueryClientProvider>
  );
}

const rootElement = document.getElementById("app");

if (!rootElement) {
  throw new Error("Root element not found");
}

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}

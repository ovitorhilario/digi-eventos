import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import type { AuthContextType } from "./context/auth";

/**
 * Contexto do Router
 * Contém o estado de autenticação que será passado para todas as rotas
 */
export interface RouterContext {
  auth: AuthContextType;
}

/**
 * Instância do router com contexto de autenticação
 */
export const router = createRouter({
  routeTree,
  context: {
    // auth será inicialmente indefinido
    // Será passado do componente App
    auth: undefined!,
  },
  defaultPreload: "intent",
});

// Register router para type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default router;

import { axiosInstance as api } from "./client";

export const setupClientInterceptors = (
  accessToken: string | null,
  onTokenRefresh?: (newToken: string) => void,
  onLogout?: () => void
) => {
  // Request interceptor - adiciona o access token
  const requestInterceptor = api.interceptors.request.use(
    (config) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - trata expiração do token
  const responseInterceptor = api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const notCheck = ['/auth/me', '/auth/sign-in'];

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !notCheck.includes(originalRequest.url)
      ) {
        originalRequest._retry = true;

        try {
          // Tenta fazer refresh do token chamando /auth/me
          const refreshResponse = await api.get('/auth/me');

          if (refreshResponse.data?.accessToken) {
            const newToken = refreshResponse.data.accessToken;

            // Notifica o contexto sobre o novo token
            if (onTokenRefresh) {
              onTokenRefresh(newToken);
            }

            // Atualiza o header da requisição original com o novo token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            // Repete a requisição original com o novo token
            return api(originalRequest);
          } else {
            throw new Error('No access token in refresh response');
          }
        } catch (refreshError) {
          // Se o refresh falha, chama o callback de logout
          if (onLogout) {
            onLogout();
          }
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  // Função de cleanup para remover os interceptors
  return () => {
    api.interceptors.request.eject(requestInterceptor);
    api.interceptors.response.eject(responseInterceptor);
  };
};

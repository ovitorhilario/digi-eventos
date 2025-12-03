import React, { createContext, useContext, useState, useEffect, useCallback, useLayoutEffect } from 'react'
import { getAuthMe, postAuthLogin, postAuthLogout } from '@/http/gen/clients'
import { setupClientInterceptors } from '@/http/interceptors'
import type { GetAuthMe200 } from '@/http/gen/types'

type User = GetAuthMe200['user']

export interface AuthContextType {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
  authIsRetrieved: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  setAccessToken: (token: string | null) => void
  error: string | null
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [authIsRetrieved, setAuthIsRetrieved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkAuth = useCallback(async () => {
    try {
      const result = await getAuthMe();
      if (result?.user && result?.accessToken) {
        setUser(result.user)
        setAccessToken(result.accessToken)
        setError(null)
      } else {
        setUser(null)
        setAccessToken(null)
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg)
      setUser(null)
      setAccessToken(null)
    } finally {
      setAuthIsRetrieved(true)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await postAuthLogin({
        email,
        password,
      })

      setAccessToken(response.accessToken)
      setUser(response.user)
      setError(null)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg)
      setUser(null)
      setAccessToken(null)
      throw e
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await postAuthLogout()
      setError(null)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg)
    }

    setUser(null)
    setAccessToken(null)
  }, [])

  useLayoutEffect(() => {
    const cleanup = setupClientInterceptors(
      accessToken,
      (newToken) => {
        // Callback chamado quando o token é refreshed
        setAccessToken(newToken);
      },
      () => {
        // Callback para quando o refresh falha
        setUser(null);
        setAccessToken(null);
        setError('Sessão expirada');
      }
    );
    return cleanup;
  }, [accessToken]);

  const clearError = useCallback(() => setError(null), [])

  const value: AuthContextType = {
    user,
    accessToken,
    isLoading,
    isAuthenticated: !!user,
    authIsRetrieved,
    login,
    logout,
    setUser,
    setAccessToken,
    error,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

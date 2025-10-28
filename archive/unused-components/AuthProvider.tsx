'use client'

import React, { createContext, useContext } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'

interface AuthContextType {
  user: any
  isAuthenticated: boolean
  isLoading: boolean
  error?: any
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, error, isLoading } = useUser()

  const logout = () => {
    window.location.href = '/api/auth/logout'
  }

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    logout,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}
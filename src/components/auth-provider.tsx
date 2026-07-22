"use client"

import { createContext, useContext, type ReactNode } from "react"
import { authClient } from "@/lib/auth-client"

interface AuthState {
  session: { userId: string; name: string; email: string } | null
  isPending: boolean
}

const AuthContext = createContext<AuthState>({ session: null, isPending: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isPending } = authClient.useSession()

  const session = data?.session && data?.user
    ? { userId: data.user.id, name: data.user.name, email: data.user.email }
    : null

  return (
    <AuthContext.Provider value={{ session, isPending }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

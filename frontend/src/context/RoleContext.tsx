"use client"

import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { useAuth } from "./AuthContext"

export type UserRole = "sensei" | "student"

interface RoleContextType {
  currentRole: UserRole
  setRole: (role: UserRole) => void
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [currentRole, setRole] = useState<UserRole>("student")

  useEffect(() => {
    if (user?.role === "sensei" || user?.role === "student") {
      setRole(user.role)
    }
  }, [user])

  return (
    <RoleContext.Provider value={{ currentRole, setRole }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole(): RoleContextType {
  const ctx = useContext(RoleContext)
  if (!ctx) {
    throw new Error("useRole must be used within a RoleProvider")
  }
  return ctx
}
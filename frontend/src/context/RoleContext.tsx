"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "@/context/AuthContext";

export type UserRole = "sensei" | "student";

interface RoleContextType {
  currentRole: UserRole;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentRole, setCurrentRole] = useState<UserRole>("student");

  useEffect(() => {
    if (user?.role === "sensei" || user?.role === "student") {
      setCurrentRole(user.role);
    } else {
      setCurrentRole("student");
    }
  }, [user]);

  return (
    <RoleContext.Provider value={{ currentRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextType {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within a RoleProvider");
  return ctx;
}
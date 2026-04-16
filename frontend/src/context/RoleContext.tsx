"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "sensei" | "user";

interface RoleContextType {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  // Default to sensei as requested, but allow toggling
  const [currentRole, setRole] = useState<UserRole>("sensei");

  return (
    <RoleContext.Provider value={{ currentRole, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}

"use client";

import { useState } from "react";
import { Bell, LogOut, Menu, Search, UserCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ConfirmDialog from "./ConfirmDialog";

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const [showDialogLogout, setShowDialogLogout] = useState(false);

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 flex items-center justify-between px-4 md:px-8 shadow-sm transition-all duration-300">
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Buka menu"
        >
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-800">
              {user?.username}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5 ${
                user?.role === "sensei"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {user?.role}
            </span>
          </div>

          {/* Avatar */}
          <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-slate-100 shrink-0">
            <UserCircle2 size={22} />
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200" />

        {/* Logout */}
        <button
          onClick={() => setShowDialogLogout(true)}
          title="Logout"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      <ConfirmDialog
        isOpen={showDialogLogout}
        title="Logout"
        description="Are you sure want to logout?"
        confirmLabel="Logout"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={logout}
        onCancel={() => setShowDialogLogout(false)}
      />
    </header>
  );
}
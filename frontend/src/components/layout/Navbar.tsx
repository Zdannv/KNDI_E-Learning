"use client";

import { useRole } from "@/context/RoleContext";
import { UserCircle2, Menu } from "lucide-react";

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { currentRole, setRole } = useRole();

  const toggleRole = () => {
    setRole(currentRole === "sensei" ? "user" : "sensei");
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 flex items-center justify-between px-4 md:px-8 shadow-sm transition-all duration-300">
      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2-text-slate-500 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-800 hidden sm:block">
              {currentRole === "sensei" ? "Sensei Taro" : "Siswa Budi"}
            </span>
            <button
              onClick={toggleRole}
              className={`text-xs font-medium px-2 py-0.5 rounded-full transition-colors mt-0.5 ${
                currentRole === "sensei"
                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              }`}
              title="Click to toggle role for testing"
            >
              Role: {currentRole === "sensei" ? "Sensei" : "User"}
            </button>
          </div>
          <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-slate-100">
            <UserCircle2 size={24} />
          </div>
        </div>
      </div>
    </header>
  );
}

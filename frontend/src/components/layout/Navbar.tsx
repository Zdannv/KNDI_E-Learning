"use client";

import React from "react";
import { useRole } from "@/context/RoleContext";
import { Bell, Search, UserCircle2, Menu } from "lucide-react";

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

        <div className="hidden sm:flex items-center bg-slate-100 rounded-full px-4 py-2 w-48 md:w-64 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:bg-white transition-all">
          <Search size={18} className="text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Cari materi..."
            className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>

        <div className="h-6 w-px bg-slate-200"></div>

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

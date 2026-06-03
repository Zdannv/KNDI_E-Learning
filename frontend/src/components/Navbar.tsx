"use client";

import React, { useState } from "react";
import { Bell, LogOut, Menu, Search, UserCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {

    if (showLogoutConfirm) {
      logout();
    } else {
      setShowLogoutConfirm(true);
      setTimeout(() => setShowLogoutConfirm(false), 3000);
    }
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 flex items-center justify-between px-4 md:px-8 shadow-sm">
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Buka menu"
        >
          <Menu size={24} />
        </button>

        {/* Search bar */}
        <div className="hidden sm:flex items-center bg-slate-100 rounded-full px-4 py-2 w-48 md:w-64 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:bg-white transition-all">
          <Search size={18} className="text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Cari materi..."
            className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        {/* Notification bell */}
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-800">
              {user?.username}
            </span>
            {/* Role badge */}
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
          onClick={handleLogout}
          title={showLogoutConfirm ? "Klik lagi untuk keluar" : "Keluar"}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
            showLogoutConfirm
              ? "bg-red-600 text-white hover:bg-red-700"
              : "text-slate-500 hover:text-red-600 hover:bg-red-50"
          }`}
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">
            {showLogoutConfirm ? "Yakin keluar?" : "Keluar"}
          </span>
        </button>
      </div>
    </header>
  );
}
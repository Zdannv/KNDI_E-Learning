"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ClipboardList,
  History,
  LayoutDashboard,
  Library,
  FileQuestion,
  GraduationCap
} from "lucide-react";
import { useRole } from "@/context/RoleContext";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const userRoutes: NavItem[] = [
  { name: "Materi Pembelajaran", href: "/materi", icon: BookOpen },
  { name: "Kuis", href: "/kuis", icon: ClipboardList },
  { name: "Riwayat Nilai", href: "/riwayat", icon: History },
];

const senseiRoutes: NavItem[] = [
  { name: "Dashboard Admin", href: "/admin", icon: LayoutDashboard },
  { name: "Manajemen Materi", href: "/admin/materi", icon: Library },
  { name: "Manajemen Kuis", href: "/admin/kuis", icon: FileQuestion },
];

export default function Sidebar() {
  const { currentRole } = useRole();
  const pathname = usePathname();

  const routes = currentRole === "sensei" ? [...userRoutes, ...senseiRoutes] : userRoutes;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col shadow-sm transition-all duration-300 z-20">
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <div className="bg-indigo-600 p-2 rounded-lg text-white">
          <GraduationCap size={24} />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
          KNDI Learning
        </span>
      </div>

      <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
          Menu Utama
        </div>
        {routes.map((route) => {
          const isActive = pathname === route.href || pathname.startsWith(`${route.href}/`);
          const Icon = route.icon;

          return (
            <Link
              key={route.href}
              href={route.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon
                size={20}
                className={isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}
              />
              <span>{route.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-xl p-4 text-sm text-center text-slate-500">
          <p className="font-medium text-slate-700 mb-1">Butuh Bantuan?</p>
          <a href="#" className="text-indigo-600 hover:underline">Hubungi Support</a>
        </div>
      </div>
    </aside>
  );
}

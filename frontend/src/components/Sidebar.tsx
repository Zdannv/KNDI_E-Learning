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
  GraduationCap,
  X,
} from "lucide-react";
import { useRole } from "@/context/RoleContext";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const studentSection: NavSection = {
  label: "Main Menu",
  items: [
    { name: "Materi Pembelajaran", href: "/courses", icon: BookOpen },
    { name: "Kuis", href: "/kuis", icon: ClipboardList },
    { name: "Riwayat Nilai", href: "/riwayat", icon: History },
  ],
};

const senseiSection: NavSection = {
  label: "Management",
  items: [
    { name: "Dashboard Admin", href: "/admin", icon: LayoutDashboard },
    { name: "Manajemen Materi", href: "/admin/courses", icon: Library },
    { name: "Manajemen Kuis", href: "/admin/kuis", icon: FileQuestion },
  ],
};

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

function NavLink({
  item,
  onClick,
}: {
  item: NavItem;
  onClick?: () => void;
}) {
  const pathname = usePathname();

  const isActive =
    item.href === "/admin"
      ? pathname === "/admin"
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group ${
        isActive
          ? "bg-indigo-50 text-indigo-700 font-semibold"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <Icon
        size={20}
        className={
          isActive
            ? "text-indigo-600"
            : "text-slate-400 group-hover:text-slate-600"
        }
      />
      <span className="text-sm">{item.name}</span>
    </Link>
  );
}

export default function Sidebar({ isOpen = false, setIsOpen }: SidebarProps) {
  const { currentRole } = useRole();

  const sections: NavSection[] =
    currentRole === "sensei"
      ? [studentSection, senseiSection]
      : [studentSection];

  const closeMenu = () => setIsOpen?.(false);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden"
          onClick={closeMenu}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200
          h-screen flex flex-col shadow-sm
          transform transition-transform duration-300
          md:sticky md:top-0 md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-6 flex items-center justify-between gap-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shrink-0">
              <GraduationCap size={24} />
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
              KNDI Learning
            </span>
          </div>
          <button
            onClick={closeMenu}
            className="md:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Tutup menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 py-6 px-4 space-y-6 overflow-y-auto">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink key={item.href} item={item} onClick={closeMenu} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
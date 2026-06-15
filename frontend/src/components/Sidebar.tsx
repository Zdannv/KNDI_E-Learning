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
  Users,
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
    { name: "Courses", href: "/courses", icon: BookOpen },
    { name: "Quizzes", href: "/quizzes", icon: ClipboardList },
    { name: "Score History", href: "/history", icon: History },
  ],
};

const senseiSection: NavSection = {
  label: "Management",
  items: [
    { name: "Dashboard Sensei", href: "/admin", icon: LayoutDashboard },
    { name: "Courses Management", href: "/admin/courses", icon: Library },
    { name: "Quizzes Management", href: "/admin/quizzes", icon: FileQuestion },
    { name: "Students Management", href: "/admin/students", icon: Users },
  ],
};

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

<<<<<<< HEAD
function NavLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
=======
function NavLink({
  item,
  onClick,
}: {
  item: NavItem;
  onClick?: () => void;
}) {
>>>>>>> origin/main
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
<<<<<<< HEAD
        className={isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}
=======
        className={
          isActive
            ? "text-indigo-600"
            : "text-slate-400 group-hover:text-slate-600"
        }
>>>>>>> origin/main
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
<<<<<<< HEAD
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden transition-opacity"
=======
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden"
>>>>>>> origin/main
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
<<<<<<< HEAD
          <a href="/dashboard" className="flex items-center gap-3">
            <div className="p-1 rounded-lg shrink-0">
              <img src="/icon_kndi.svg" alt="Logo KNDI" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
              KNDI Learning
            </span>
          </a>
=======
          <div>
            <a href="/dashboard" className="flex items-center gap-3">
              <div className="p-1 rounded-lg shrink-0">
                <img src="/icon_kndi.svg" alt="Logo KNDI" className="w-8 h-8 object-contain" />
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                KNDI Learning
              </span>
            </a>
          </div>
>>>>>>> origin/main
          <button
            onClick={closeMenu}
            className="md:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Tutup menu"
          >
            <X size={20} />
          </button>
        </div>

<<<<<<< HEAD
        <div className="flex-1 py-6 px-4 overflow-y-auto space-y-6">
          {sections.map((section) => (
            <div key={section.label}>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
                {section.label}
              </div>
              <div className="space-y-1">
=======
        <div className="flex-1 py-6 px-4 overflow-y-auto">
          {sections.map((section) => (
            <div key={section.label}>
              <div className="space-y-2">
>>>>>>> origin/main
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
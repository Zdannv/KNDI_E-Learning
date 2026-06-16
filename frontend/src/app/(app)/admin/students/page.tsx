"use client";

import React, { useEffect, useState, useTransition } from "react";
import {
  Users,
  Search,
  UserPlus,
  Trash2,
  Mail,
  User,
  X,
  AlertCircle,
  Loader2,
  Calendar,
  Lock,
} from "lucide-react";
import { StudentUser, studentApi } from "@/app/lib/use-api";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function StudentsManagementPage() {
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Student Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "sensei">("student");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Delete Confirmation States
  const [studentToDelete, setStudentToDelete] = useState<StudentUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch student list
  const loadStudents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await studentApi.list();
      setStudents(data || []);
    } catch (err: any) {
      setError(err?.message || "Gagal memuat data siswa.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Filter students based on search query
  const filteredStudents = students.filter(
    (student) =>
      student.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle Create Student
  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!username.trim() || !email.trim() || !password.trim()) {
      setModalError("Semua field wajib diisi.");
      return;
    }

    if (username.trim().length < 3) {
      setModalError("Username minimal 3 karakter.");
      return;
    }

    if (password.length < 6) {
      setModalError("Password minimal 6 karakter.");
      return;
    }

    setIsSubmitting(true);
    try {
      await studentApi.create({
        username: username.trim(),
        email: email.trim(),
        password: password,
        role: role,
      });

      // Reset Form & Close Modal
      setUsername("");
      setEmail("");
      setPassword("");
      setRole("student");
      setIsAddModalOpen(false);
      
      // Reload Students
      await loadStudents();
    } catch (err: any) {
      setModalError(err?.message || "Gagal menambahkan akun baru.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Student
  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;

    setIsDeleting(true);
    try {
      await studentApi.delete(studentToDelete.id);
      setStudentToDelete(null);
      await loadStudents();
    } catch (err: any) {
      alert(err?.message || "Gagal menghapus akun.");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Header & Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Kelola Akun Pengguna</h1>
          <p className="text-slate-600">
            Daftarkan akun siswa atau sensei baru, monitoring daftar kelas, dan hapus akun.
          </p>
        </div>
        <button
          onClick={() => {
            setModalError(null);
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-5 rounded-xl transition-all shadow-sm shadow-indigo-100 shrink-0"
        >
          <UserPlus className="w-5 h-5" />
          Tambah Akun Baru
        </button>
      </div>

      {/* Search Bar & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Cari berdasarkan username atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400 text-slate-800 text-sm font-medium"
          />
        </div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Total Terdaftar: <span className="text-indigo-600 text-sm font-black">{filteredStudents.length} pengguna</span>
        </div>
      </div>

      {/* Main Table / View */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-12 flex flex-col items-center justify-center gap-4 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-slate-500 font-semibold text-sm">Memuat data pengguna...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-center gap-4">
          <AlertCircle className="w-8 h-8 shrink-0 text-red-650" />
          <div>
            <h3 className="font-bold text-base">Terjadi Kesalahan</h3>
            <p className="text-sm mt-0.5">{error}</p>
          </div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-16 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="bg-slate-50 p-5 rounded-full border border-slate-100 mb-4">
              <Users className="w-10 h-10 text-slate-355" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-1">Pengguna Tidak Ditemukan</h3>
            <p className="text-sm text-slate-400">
              {searchQuery ? "Coba kata kunci pencarian yang lain atau daftarkan akun baru." : "Belum ada akun terdaftar. Klik tombol Tambah Akun Baru untuk memulai."}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Nama Pengguna</th>
                  <th className="px-6 py-4 font-semibold">Alamat Email</th>
                  <th className="px-6 py-4 font-semibold">Tanggal Terdaftar</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                          {student.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm leading-snug">{student.username}</p>
                          <span className={`text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded uppercase ${
                            student.role === "sensei" ? "text-indigo-650 bg-indigo-50 border border-indigo-100" : "text-slate-500 bg-slate-100"
                          }`}>{student.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span>{student.email || "-"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-650">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{formatDate(student.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setStudentToDelete(student)}
                        className="inline-flex items-center justify-center p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        title="Hapus Akun"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => !isSubmitting && setIsAddModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-150 p-6 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-500" />
                Tambah Akun
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                disabled={isSubmitting}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Error */}
            {modalError && (
              <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
                <p className="text-xs font-semibold leading-normal">{modalError}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAddStudentSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Contoh: BudiSetiawan"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Alamat Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="budi.setiawan@kndi.co.id"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Password Akun
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {/* Role Select */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Role Akun
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "student" | "sensei")}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm font-medium"
                >
                  <option value="student">Siswa (Student)</option>
                  <option value="sensei">Sensei (Teacher)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-650 font-bold rounded-xl transition-all text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-sm shadow-indigo-150 flex items-center justify-center gap-2 text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    "Daftarkan Akun"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={studentToDelete !== null}
        title="Hapus Akun Pengguna?"
        description={`Anda yakin ingin menghapus akun "${studentToDelete?.username}"? Aksi ini akan menghapus permanen semua histori nilai kuis dan riwayat pengerjaan mereka.`}
        confirmLabel="Hapus Permanen"
        cancelLabel="Batal"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setStudentToDelete(null)}
      />
    </div>
  );
}

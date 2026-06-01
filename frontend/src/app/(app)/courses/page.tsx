"use client"

import { Material, materialApi } from "@/app/lib/use-api"
import { useAsync } from "@/hooks/useAsync"
import {
  AlertCircle, ArrowUpDown, Calendar, CheckCircle2,
  ChevronLeft, ChevronRight, Download, Eye, FileText,
  Presentation, Search, X,
} from "lucide-react"
import { useCallback, useState } from "react"

const ITEMS_PER_PAGE = 10

function buildFileUrl(filepath: string | null): string | null {
  if (!filepath) return null

  const cleaned = filepath.replace(/^\.\//, "")

  return `/${cleaned}`
}

function isPdf(filepath: string | null): boolean {
  return !!filepath && filepath.toLowerCase().endsWith("pdf")
}

function fileName(filePath: string | null): string {
  if (!filePath) return ""
  return filePath.split("/").pop() ?? filePath
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function MaterialSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse h-64 flex flex-col">
          <div className="h-12 w-12 bg-slate-200 rounded-xl mb-4" />
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-slate-200 rounded w-full mb-1" />
          <div className="h-3 bg-slate-200 rounded w-2/3 mb-1" />
          <div className="h-8 bg-slate-200 rounded w-1/2 mt-auto" />
        </div>
      ))}
    </div>
  )
}

export default function MaterialPage() {
  const [toastMessage,  setToastMessage]  = useState<string | null>(null)
  const [viewingMateri, setViewingMateri] = useState<Material | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy,      setSortBy]      = useState<"latest" | "oldest">("latest")
  const [currentPage, setCurrentPage] = useState(1)
  const fetchMaterials = useCallback(() => materialApi.getAll(), [])
  const { data: materials, isLoading, error } = useAsync<Material[]>(fetchMaterials)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleDownload = (materi: Material) => {
    const url = buildFileUrl(materi.file_path)
    if (!url) { showToast("File is not available!"); return }

    const link = document.createElement("a")
    link.href = url
    link.download = fileName(materi.file_path)
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast(`Download: ${materi.name}`)
  }

  const filtered = (materials ?? []).filter((m) => {
    const q = searchQuery.toLowerCase()
    return (
      m.name.toLowerCase().includes(q) ||
      (m.description ?? "").toLowerCase().includes(q)
    )
  })

  const sorted = [...filtered].sort((a, b) => {
    const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    return sortBy === "latest" ? -diff : diff
  })

  const totalPages  = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE))
  const safePage    = Math.min(currentPage, totalPages)
  const startIndex  = (safePage - 1) * ITEMS_PER_PAGE
  const paginated   = sorted.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handleSearch = (value: string) => { setSearchQuery(value); setCurrentPage(1) }
  const handleSort   = (value: "latest" | "oldest") => { setSortBy(value); setCurrentPage(1) }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Materi Pembelajaran</h1>
        <p className="text-slate-600">
          Akses dan pelajari materi presentasi atau PDF secara mandiri langsung dari browser Anda.
        </p>
      </div>

      {/* Search + Sort bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        {/* Search */}
        <div className="grow flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:bg-white focus-within:border-indigo-400 transition-all">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Cari materi berdasarkan judul atau deskripsi..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Sort */}
          <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value as "latest" | "oldest")}
              className="bg-transparent border-none outline-none text-sm text-slate-700 font-medium cursor-pointer"
            >
              <option value="latest">Tanggal Upload: Terbaru</option>
              <option value="oldest">Tanggal Upload: Terlama</option>
            </select>
          </div>

          {/* Count */}
          <div className="text-sm text-slate-500 font-medium self-center px-1">
            Total: <span className="font-bold text-slate-800">{sorted.length}</span> materi
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && <MaterialSkeleton />}

      {/* Empty state */}
      {!isLoading && !error && sorted.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 flex flex-col items-center text-center">
          <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-full mb-6 text-indigo-400">
            <Presentation className="w-12 h-12" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            {searchQuery ? "Materi Tidak Ditemukan" : "Belum Ada Materi"}
          </h3>
          <p className="text-slate-500 max-w-md leading-relaxed">
            {searchQuery
              ? "Tidak ditemukan materi yang sesuai dengan kata kunci Anda. Silakan coba kata kunci lain."
              : "Materi akan tampil di sini setelah sensei mengunggahnya."}
          </p>
        </div>
      )}

      {/* Material grid */}
      {!isLoading && !error && paginated.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginated.map((materi) => (
            <div
              key={materi.id}
              className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 flex flex-col h-full"
            >
              <div className="p-5 grow flex flex-col">
                {/* File type icon */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl transition-colors duration-300 group-hover:text-white ${
                    isPdf(materi.file_path)
                      ? "bg-rose-50 text-rose-600 group-hover:bg-rose-600"
                      : "bg-blue-50 text-blue-600 group-hover:bg-blue-600"
                  }`}>
                    {isPdf(materi.file_path)
                      ? <FileText className="h-6 w-6" />
                      : <Presentation className="h-6 w-6" />}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {materi.name}
                </h3>

                {/* Description */}
                <p className="text-slate-600 text-sm mb-5 line-clamp-3 grow">
                  {materi.description}
                </p>
                {/* Meta */}
                <div className="flex flex-col space-y-2 mt-auto">
                  <div className="flex items-center text-xs text-slate-500 font-medium">
                    <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                    <span>{formatDate(materi.created_at)}</span>
                  </div>
                  {materi.file_path && (
                    <div className="flex items-center text-xs text-slate-500 font-medium">
                      <FileText className="h-4 w-4 mr-2 text-slate-400" />
                      <span className="truncate" title={fileName(materi.file_path)}>
                        {fileName(materi.file_path)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {/* Actions */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 mt-auto grid grid-cols-2 gap-3">
                <button
                  onClick={() => setViewingMateri(materi)}
                  className="w-full flex items-center justify-center space-x-1.5 bg-blue-600 text-white hover:bg-blue-700 font-semibold py-2.5 px-3 rounded-lg transition-colors duration-300 active:scale-95 text-sm"
                >
                  <Eye className="h-4 w-4" />
                  <span>Lihat</span>
                </button>
                <button
                  onClick={() => handleDownload(materi)}
                  disabled={!materi.file_path}
                  className="w-full flex items-center justify-center space-x-1.5 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-800 font-semibold py-2.5 px-3 rounded-lg transition-colors duration-300 active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4" />
                  <span>Unduh</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={safePage === 1}
            className="flex items-center gap-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Sebelumnya
          </button>

          {/* Page numbers — desktop */}
          <div className="hidden sm:flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                  safePage === page
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Mobile label */}
          <span className="sm:hidden text-sm font-semibold text-slate-500">
            Halaman {safePage} dari {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={safePage === totalPages}
            className="flex items-center gap-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Selanjutnya
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Viewer Modal ─────────────────────────────────────────────────────── */}
      {viewingMateri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className={`p-2 rounded-lg shrink-0 ${
                  isPdf(viewingMateri.file_path)
                    ? "bg-rose-100 text-rose-600"
                    : "bg-blue-100 text-blue-600"
                }`}>
                  {isPdf(viewingMateri.file_path)
                    ? <FileText className="h-5 w-5" />
                    : <Presentation className="h-5 w-5" />}
                </div>
                <div className="truncate pr-4">
                  <h3 className="font-bold text-slate-800 truncate">{viewingMateri.name}</h3>
                  <p className="text-xs text-slate-500 truncate">
                    {fileName(viewingMateri.file_path) || "Tidak ada file"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingMateri(null)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors shrink-0"
                title="Tutup Preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 bg-slate-100 overflow-hidden flex flex-col items-center justify-center relative">
              {isPdf(viewingMateri.file_path) && buildFileUrl(viewingMateri.file_path) ? (
                <iframe
                  src={buildFileUrl(viewingMateri.file_path)!}
                  className="w-full h-full border-0"
                  title={viewingMateri.name}
                />
              ) : (
                <>
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 pointer-events-none select-none">
                    <Presentation className="w-32 h-32 text-slate-300 mb-4" />
                    <p className="text-slate-400 font-bold text-xl uppercase tracking-widest">
                      Pratinjau Tidak Tersedia
                    </p>
                  </div>
                  <div className="relative z-10 w-full max-w-3xl bg-white shadow-md rounded-lg border border-slate-200 flex flex-col items-center justify-center p-8 sm:p-12 text-center m-4 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-blue-500 to-indigo-500" />
                    <Presentation className="w-16 h-16 text-blue-200 mb-6" />
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-4 leading-tight">
                      {viewingMateri.name}
                    </h2>
                    <p className="text-slate-600 text-base sm:text-lg mb-6 max-w-xl">
                      {viewingMateri.description ?? ""}
                    </p>
                    <p className="text-sm text-slate-400 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2">
                      Format PowerPoint (.pptx) tidak dapat ditampilkan di browser.
                      Silakan unduh file untuk melihat isinya.
                    </p>
                    <div className="mt-auto pt-6 border-t border-slate-100 w-full flex justify-between text-xs font-semibold text-slate-400">
                      <span>© PT Kyodo News Digital Indonesia</span>
                      <span>{fileName(viewingMateri.file_path)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal footer */}
            <div className="bg-white px-6 py-4 border-t border-slate-100 flex justify-between items-center shrink-0">
              <div className="text-sm font-medium text-slate-500 hidden sm:block">
                Diunggah: <span className="text-slate-700">{formatDate(viewingMateri.created_at)}</span>
              </div>
              <button
                onClick={() => { handleDownload(viewingMateri); setViewingMateri(null) }}
                disabled={!viewingMateri.file_path}
                className="flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-5 py-2.5 rounded-lg font-semibold transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Dokumen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-60">
          <div className="bg-slate-800 shadow-xl rounded-xl px-5 py-4 flex items-center space-x-3">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <span className="font-medium text-sm text-white">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  )
}
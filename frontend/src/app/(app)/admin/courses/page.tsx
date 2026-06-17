"use client"

import { ClientApiError, Material, materialApi } from "@/app/lib/use-api"
import { useAsync } from "@/hooks/useAsync"
import { AlertCircle, ArrowUpDown, CheckCircle2, ChevronLeft, ChevronRight, Edit2, FileIcon, List, Loader2, RefreshCw, Search, Trash2, UploadCloud, X } from "lucide-react"
import { ChangeEvent, DragEvent ,FormEvent, useCallback, useRef, useState } from "react"

const ITEMS_PER_PAGE = 10
const MAX_FILE_SIZE_MB = 50
const MAX_FILE_SIZE_BYTE = 50 * 1024 * 1024
const ALLOWED_EXTENSIONS = [".pdf", ".pptx"]

interface MateriFormState {
  name: string
  description: string
  file: File | null
}
const EMPTY_FORM: MateriFormState = { name: "", description: "", file: null };

function isPdf(filepath: string | null | undefined): boolean {
  return !!filepath && filepath.toLowerCase().endsWith(".pdf")
}

function getFileName(filepath: string | null | undefined): string {
  if (!filepath) return "-"
  return filepath.split("/").pop() ?? filepath
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  })
}

function TableSkeleton() {
  return (
    <div className="animate-pulse divide-y divide-slate-100">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center px-6 py-5 gap-4">
          <div className="w-10 h-10 bg-slate-200 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="w-48 h-4 bg-slate-200 rounded" />
            <div className="w-72 h-3 bg-slate-200 rounded" />
          </div>
          <div className="w-20 h-4 bg-slate-200 rouned" />
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-slate-200 rounded-lg" />
            <div className="w-8 h-8 bg-slate-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AdminMateriPage() {
  const fetchMaterials = useCallback(() => materialApi.getAll(), [])
  const { 
    data: materials, 
    isLoading: listLoading, 
    error: listError, 
    refetch
  } = useAsync<Material[]>(fetchMaterials)
  const [activeTab, setActiveTab] = useState<"upload" | "list">("list")
  const [editingMateri, setEditingMateri] = useState<Material | null>(null)
  const [formState, setFormState] = useState<MateriFormState>(EMPTY_FORM)
  const [isDragging, setIsDragging] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest")
  const [currentPage, setCurrentPage] = useState(1)

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

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE
  const paginated = sorted.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handleSearch = (value: string) => { setSearchQuery(value); setCurrentPage(1) }
  const handleSort = (value: "latest" | "oldest") => { setSortBy(value); setCurrentPage(1) }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000);
  }

  const validateAndSetFile = (file: File) => {
    setFileError(null)
    const lowerName = file.name.toLowerCase()

    if (!ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext))) {
      setFileError("File format is not valid. Please upload pdf or pptx file")
      return
    }

    if (file.size > MAX_FILE_SIZE_BYTE) {
      setFileError(`Maximum file size is ${MAX_FILE_SIZE_MB}`)
      return
    }

    setFormState((prev) => ({ ...prev, file }))
  }

  const handleDragOver  = (e: DragEvent<HTMLDivElement>) => { 
    e.preventDefault(); e.stopPropagation(); setIsDragging(true)
  }
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { 
    e.preventDefault(); e.stopPropagation(); setIsDragging(false)
  }
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) validateAndSetFile(file)
  }
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) validateAndSetFile(file)
  }
  const removeFile = () => {
    setFormState((prev) => ({ ...prev, file: null }))
    setFileError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  };

  const resetForm = () => {
    setFormState(EMPTY_FORM)
    setEditingMateri(null)
    setFileError(null)
    setSubmitError(null)
    if (fileInputRef.current) fileInputRef.current.value ?? ""
    setActiveTab("list")
  }

  const handleEdit = (materi: Material) => {
    setFormState({ name: materi.name, description: materi.description ?? "", file: null })
    setEditingMateri(materi)
    setFileError(null)
    setSubmitError(null)
    setActiveTab("upload")
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitError(null)

    if (!formState.name.trim()) {
      setSubmitError("Materi name is required")
      return
    }

    if (!editingMateri && !formState.file) {
      setSubmitError("Materi file is required")
      return
    }

    if (fileError) return
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("name", formState.name.trim())
      if (formState.description.trim()) {
        formData.append("description", formState.description.trim())
      }
      if (formState.file) {
        formData.append("file_path", formState.file)
      }

      if (editingMateri) {
        await materialApi.update(editingMateri.id, formData)
        showToast("Materi is updated")
      } else {
        await materialApi.create(formData)
        showToast("Successfuly uploaded materi")
      }

      refetch()
      resetForm()
    } catch (err) {
      setSubmitError(err instanceof ClientApiError ? err.message : "An error has occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (materi: Material) => {
    if (!confirm(`Are you sure want to delete this materi ${materi.name}`)) return
    try {
      await materialApi.delete(materi.id)
      showToast(`Materi ${materi.name} is deleted`)
      refetch()
    } catch (err) {
      showToast(
        err instanceof ClientApiError ? err.message : "Failed to delete materi"
      )
    }
  }

  const isFormValid = formState.name.trim() !== "" && !fileError && (editingMateri ? true : formState.file !== null)

    return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto min-h-[85vh]">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Manajemen Materi</h1>
        <p className="text-slate-600">
          Kelola daftar materi presentasi dan dokumen untuk diakses oleh murid.
        </p>
      </div>
 
      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-slate-200">
        <button
          onClick={() => {
            setActiveTab("upload");
            if (!editingMateri) {
              setFormState(EMPTY_FORM);
              setFileError(null);
              setSubmitError(null);
            }
          }}
          className={`flex items-center space-x-2 px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === "list"
              ? "text-blue-600 border-blue-600"
              : "text-slate-500 border-transparent hover:text-slate-700"
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>{editingMateri ? "Edit Materi" : "Unggah Baru"}</span>
        </button>
 
        <button
          onClick={() => {
            setActiveTab("list");
            if (editingMateri) resetForm();
          }}
          className={`flex items-center space-x-2 px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === "list"
              ? "text-blue-600 border-blue-600"
              : "text-slate-500 border-transparent hover:text-slate-700"
          }`}
        >
          <List className="w-4 h-4" />
          <span>Daftar Materi</span>
          {/* Badge shows real count from API */}
          <span className="ml-1 bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs font-bold">
            {materials?.length ?? 0}
          </span>
        </button>
      </div>
 
      {/* ── Upload / Edit tab ── */}
      {activeTab === "upload" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Card header */}
          <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">
              {editingMateri ? "Perbarui Data Materi" : "Formulir Unggah Materi Baru"}
            </h2>
            {editingMateri && (
              <button
                onClick={resetForm}
                className="text-sm font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                <X className="w-4 h-4" /> Batal Edit
              </button>
            )}
          </div>
 
          <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-6">
 
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
                Judul Materi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                required
                placeholder="Contoh: Bab 1 — Pengenalan Hiragana Dasar"
                value={formState.name}
                onChange={(e) => setFormState((p) => ({ ...p, name: e.target.value }))}
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 disabled:opacity-60"
              />
            </div>
 
            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-semibold text-slate-700">
                Deskripsi Singkat
                <span className="text-slate-400 font-normal ml-1">(opsional)</span>
              </label>
              <textarea
                id="description"
                rows={4}
                placeholder="Berikan penjelasan singkat mengenai topik materi..."
                value={formState.description}
                onChange={(e) => setFormState((p) => ({ ...p, description: e.target.value }))}
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 resize-none disabled:opacity-60"
              />
            </div>
 
            {/* File upload */}
            <div className="space-y-2">
              <label className="flex items-center justify-between text-sm font-semibold text-slate-700">
                <span>
                  File Dokumen (.pptx / .pdf)
                  {!editingMateri && <span className="text-red-500 ml-1">*</span>}
                </span>
                {editingMateri && (
                  <span className="text-amber-600 text-xs font-normal bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                    Opsional — biarkan kosong untuk mempertahankan file lama
                  </span>
                )}
              </label>
 
              {/* Drop zone or selected file */}
              {!formState.file ? (
                <div
                  className={`relative group flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer
                    ${isDragging        ? "border-blue-500 bg-blue-50"
                    : fileError         ? "border-red-300 bg-red-50"
                    :                    "border-slate-300 bg-slate-50 hover:bg-slate-100"}
                    ${isSubmitting      ? "opacity-50 pointer-events-none" : ""}
                  `}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation,.pdf,application/pdf"
                    className="hidden"
                    disabled={isSubmitting}
                  />
                  <div
                    className={`p-4 rounded-full mb-4 transition-all duration-300 ${
                      isDragging
                        ? "bg-blue-100 text-blue-600"
                        : "bg-white shadow-sm text-slate-500 group-hover:text-blue-500 group-hover:scale-110"
                    }`}
                  >
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-medium text-slate-800 mb-1">
                    {editingMateri
                      ? "Klik untuk mengganti dokumen lama"
                      : "Klik atau seret file ke sini"}
                  </h3>
                  <p className="text-sm text-slate-500 text-center max-w-xs">
                    Format .pptx atau .pdf — Maks. {MAX_FILE_SIZE_MB}MB
                  </p>
                </div>
              ) : (
                /* Selected file preview */
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center space-x-4 overflow-hidden">
                    <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                      <FileIcon className="w-6 h-6" />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {formState.file.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(formState.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    disabled={isSubmitting}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0 disabled:opacity-50 transition-colors"
                    title="Hapus file"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
 
              {/* File validation error */}
              {fileError && (
                <div className="flex items-start space-x-2 text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">{fileError}</span>
                </div>
              )}
            </div>
 
            {/* API / submit error */}
            {submitError && (
              <div className="flex items-start space-x-2 text-red-600 bg-red-50 border border-red-200 p-4 rounded-xl">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{submitError}</span>
              </div>
            )}
 
            <hr className="border-slate-100" />
 
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`flex items-center space-x-2 py-3 px-8 rounded-lg font-bold shadow-sm transition-all duration-200 ${
                  !isFormValid || isSubmitting
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:scale-95"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{editingMateri ? "Simpan Perubahan" : "Unggah Materi"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
 
      {/* ── List tab ── */}
      {activeTab === "list" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
 
          {/* List error */}
          {listError && (
            <div className="flex items-center justify-between gap-3 bg-red-50 border-b border-red-100 text-red-700 px-6 py-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{listError}</p>
              </div>
              <button
                onClick={refetch}
                className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 shrink-0"
              >
                <RefreshCw className="w-4 h-4" /> Coba lagi
              </button>
            </div>
          )}
 
          {/* Loading */}
          {listLoading && <TableSkeleton />}

          {/* Search + Sort bar */}
          {!listLoading && !listError && materials && materials.length > 0 && (
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 border-b border-slate-100">
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
          )}
 
          {/* Empty state */}
          {!listLoading && !listError && sorted.length === 0 && (
            <div className="p-16 text-center flex flex-col items-center">
              <div className="bg-slate-50 p-6 rounded-full mb-4 inline-flex text-slate-400 border border-slate-100">
                <List className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {searchQuery ? "Materi Tidak Ditemukan" : "Belum Ada Materi"}
              </h3>
              <p className="text-slate-500 max-w-sm mx-auto mb-6">
                {searchQuery
                  ? "Tidak ditemukan materi yang sesuai dengan kata kunci Anda. Silakan coba kata kunci lain."
                  : "Anda belum pernah mengunggah materi. Mulai dengan mengunggah materi pertama!"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setActiveTab("upload")}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Unggah Materi
                </button>
              )}
            </div>
          )}
 
          {/* Table */}
          {!listLoading && !listError && sorted.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                      <th className="px-6 py-4 font-semibold">Dokumen</th>
                      <th className="px-6 py-4 font-semibold text-center w-36">Tanggal Upload</th>
                      <th className="px-6 py-4 font-semibold text-right w-36">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginated.map((materi) => (
                      <tr key={materi.id} className="hover:bg-slate-50/70 transition-colors">
   
                        {/* Document info */}
                        <td className="px-6 py-5">
                          <div className="flex items-start gap-4">
                            <div
                              className={`mt-0.5 p-2 rounded-lg shrink-0 ${
                                isPdf(materi.file_path)
                                  ? "bg-rose-100 text-rose-600"
                                  : "bg-blue-100 text-blue-600"
                              }`}
                            >
                              <FileIcon className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-800 line-clamp-1">
                                {materi.name}
                              </h4>
                              <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">
                                {materi.description ?? "—"}
                              </p>
                              <p className="text-xs font-medium mt-1.5 text-slate-400">
                                {getFileName(materi.file_path)}
                              </p>
                            </div>
                          </div>
                        </td>
   
                        {/* Upload date */}
                        <td className="px-6 py-5 text-center">
                          <span className="text-sm font-medium text-slate-500">
                            {formatDate(materi.created_at)}
                          </span>
                        </td>
   
                        {/* Actions */}
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(materi)}
                              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors"
                              title="Edit Materi"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(materi)}
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors"
                              title="Hapus Materi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 p-6 bg-slate-50">
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
            </>
          )}
        </div>
      )}
 
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-60">
          <div className="bg-slate-800 shadow-xl border border-slate-700 rounded-xl px-5 py-4 flex items-center space-x-3">
            <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
            <span className="font-medium text-sm text-white">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  )
}
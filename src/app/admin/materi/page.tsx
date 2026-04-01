"use client";

import React, { useState, useRef, ChangeEvent, DragEvent, FormEvent, useEffect } from "react";
import { UploadCloud, File as FileIcon, X, CheckCircle2, AlertCircle, Loader2, List, Edit2, Trash2 } from "lucide-react";

import { useLocalStorage } from "@/hooks/useLocalStorage";

interface MateriFormState {
  judul: string;
  deskripsi: string;
  file: File | null;
}

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pptx", ".pdf"];

export default function AdminMateriUploadPage() {
  const [activeTab, setActiveTab] = useState<"unggah" | "daftar">("unggah");
  const [editingMateriId, setEditingMateriId] = useState<string | null>(null);

  const [formState, setFormState] = useState<MateriFormState>({
    judul: "",
    deskripsi: "",
    file: null,
  });
  
  const [storedMateri, setStoredMateri, isClient] = useLocalStorage<any[]>("kndi_materi", []);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    setErrorMsg(null);

    // Check extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
    if (!hasValidExtension) {
      setErrorMsg("Format file tidak valid. Harap unggah file .pptx atau .pdf.");
      setFormState((prev) => ({ ...prev, file: null }));
      return;
    }

    // Check size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMsg(`Ukuran file terlalu besar. Maksimal ${MAX_FILE_SIZE_MB}MB.`);
      setFormState((prev) => ({ ...prev, file: null }));
      return;
    }

    setFormState((prev) => ({ ...prev, file }));
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      validateAndSetFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFormState((prev) => ({ ...prev, file: null }));
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formState.judul || !formState.deskripsi || (!formState.file && !editingMateriId)) {
      return;
    }

    if (errorMsg !== null) {
        return;
    }

    setIsSubmitting(true);

    const processUpload = (fileDataUrl?: string) => {
      setTimeout(() => {
        if (editingMateriId) {
          // Update Mode
          setStoredMateri((prev) => prev.map((m) => {
            if (m.id === editingMateriId) {
              return {
                ...m,
                title: formState.judul,
                description: formState.deskripsi,
                // Only overwrite file metadata if a new file was uploaded
                ...(formState.file ? {
                  fileName: formState.file.name,
                  fileDataUrl: fileDataUrl,
                  uploadDate: new Date().toISOString().split('T')[0]
                } : {}),
              };
            }
            return m;
          }));
          setToastMessage("Materi berhasil diperbarui!");
        } else {
          // Create Mode
          const newMateri = {
            id: "m" + Date.now().toString(),
            title: formState.judul,
            description: formState.deskripsi,
            uploadDate: new Date().toISOString().split('T')[0],
            fileName: formState.file?.name || "materi.pptx",
            fileDataUrl: fileDataUrl
          };
          setStoredMateri((prev) => [newMateri, ...prev]);
          setToastMessage("Materi berhasil diunggah!");
        }

        setIsSubmitting(false);
        resetForm();
        
        setTimeout(() => setToastMessage(null), 4000);
      }, 1500);
    };

    if (formState.file && formState.file.name.toLowerCase().endsWith('.pdf')) {
      const reader = new FileReader();
      reader.onload = (event) => processUpload(event.target?.result as string);
      reader.onerror = () => processUpload();
      reader.readAsDataURL(formState.file);
    } else {
      processUpload();
    }
  };

  const handleEdit = (materi: any) => {
    setFormState({
      judul: materi.title,
      deskripsi: materi.description,
      file: null // Require re-uploading file if they want to change it
    });
    setEditingMateriId(materi.id);
    setActiveTab("unggah");
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus materi ini?")) {
      setStoredMateri(prev => prev.filter(m => m.id !== id));
      setToastMessage("Materi berhasil dihapus!");
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const resetForm = () => {
    setFormState({ judul: "", deskripsi: "", file: null });
    setEditingMateriId(null);
    setActiveTab("daftar");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Only validate file if it's new upload or if they explicitly selected a new file during edit
  const isFormValid = formState.judul.trim() !== "" && 
                      formState.deskripsi.trim() !== "" && 
                      (editingMateriId ? (errorMsg === null) : (formState.file !== null && errorMsg === null));

  if (!isClient) return <div className="p-6 h-screen w-full" />;

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-[85vh]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Manajemen Materi</h1>
        <p className="text-slate-600">
          Kelola daftar materi presentasi dan dokumen untuk diakses oleh murid pengguna.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("unggah")}
          className={`flex items-center space-x-2 px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === "unggah" 
              ? "text-blue-600 border-blue-600" 
              : "text-slate-500 border-transparent hover:text-slate-700"
          }`}
        >
          {editingMateriId ? <Edit2 className="w-4 h-4" /> : <UploadCloud className="w-4 h-4" />}
          <span>{editingMateriId ? "Edit Materi" : "Unggah Baru"}</span>
        </button>
        <button
          onClick={() => {
            setActiveTab("daftar");
            if (editingMateriId) resetForm();
          }}
          className={`flex items-center space-x-2 px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === "daftar" 
              ? "text-blue-600 border-blue-600" 
              : "text-slate-500 border-transparent hover:text-slate-700"
          }`}
        >
          <List className="w-4 h-4" />
          <span>Daftar Materi</span>
          <span className="ml-2 bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs font-bold">
            {storedMateri.length}
          </span>
        </button>
      </div>

      {activeTab === "unggah" ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">
              {editingMateriId ? "Perbarui Data Materi" : "Formulir Unggah Materi Baru"}
            </h2>
            {editingMateriId && (
              <button onClick={resetForm} className="text-sm font-semibold text-slate-500 hover:text-slate-700 flex items-center">
                <X className="w-4 h-4 mr-1" /> Batal Edit
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            
            <div className="space-y-2">
              <label htmlFor="judul" className="block text-sm font-semibold text-slate-700">
                Judul Materi
              </label>
              <input
                type="text"
                id="judul"
                required
                placeholder="Contoh: Bab 1: Pengenalan Hiragana Dasar"
                value={formState.judul}
                onChange={(e) => setFormState(prev => ({ ...prev, judul: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="deskripsi" className="block text-sm font-semibold text-slate-700">
                Deskripsi Singkat
              </label>
              <textarea
                id="deskripsi"
                required
                rows={4}
                placeholder="Berikan penjelasan singkat mengenai topik materi..."
                value={formState.deskripsi}
                onChange={(e) => setFormState(prev => ({ ...prev, deskripsi: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 resize-none"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between text-sm font-semibold text-slate-700">
                <span>File Dokumen (.pptx / .pdf)</span>
                {editingMateriId && <span className="text-amber-500 text-xs font-normal bg-amber-50 px-2 py-0.5 rounded-md">Opsional jika tidak ingin mengubah file lama</span>}
              </label>
              
              {!formState.file ? (
                <div
                  className={`relative group flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer
                    ${isDragging ? 'border-blue-500 bg-blue-50' : errorMsg ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100' }
                    ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}
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
                  
                  <div className={`p-4 rounded-full mb-4 ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-white shadow-sm text-slate-500 group-hover:text-blue-500 group-hover:scale-110'} transition-all duration-300`}>
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-medium text-slate-800 mb-1">
                    {editingMateriId ? "Klik untuk mengganti dokumen lama" : "Klik atau seret file ke sini"}
                  </h3>
                  <p className="text-sm text-slate-500 text-center max-w-xs">
                    Format .pptx atau .pdf (Maks. {MAX_FILE_SIZE_MB}MB)
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl transition-all">
                  <div className="flex items-center space-x-4 overflow-hidden">
                    <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                      <FileIcon className="w-6 h-6" />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-semibold text-slate-800 truncate">{formState.file.name}</p>
                      <p className="text-xs text-slate-500">{(formState.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    disabled={isSubmitting}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0 disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {errorMsg && (
                <div className="flex items-start mt-3 space-x-2 text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium">{errorMsg}</span>
                </div>
              )}
            </div>

            <hr className="border-slate-100 my-4" />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`flex items-center space-x-2 py-3 px-8 rounded-lg font-bold shadow-sm transition-all duration-300
                  ${!isFormValid || isSubmitting ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:scale-95'}
                `}
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /><span>Menyimpan...</span></>
                ) : (
                  <><SaveIcon className="w-5 h-5" /><span>{editingMateriId ? "Simpan Perubahan" : "Unggah Materi"}</span></>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-300">
           {storedMateri.length === 0 ? (
             <div className="p-16 text-center flex flex-col items-center">
                <div className="bg-slate-50 p-6 rounded-full mb-4 inline-flex text-slate-400 border border-slate-100">
                   <List className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Materi</h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-6">Anda belum pernah mengunggah materi bahasa Jepang. Silakan unggah materi pertama Anda!</p>
                <button onClick={() => setActiveTab('unggah')} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Unggah Materi
                </button>
             </div>
           ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider border-b border-slate-200">
                     <th className="px-6 py-4 font-semibold">Dokumen</th>
                     <th className="px-6 py-4 font-semibold text-center w-32">Tanggal</th>
                     <th className="px-6 py-4 font-semibold text-right w-40">Aksi</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {storedMateri.map((materi) => (
                     <tr key={materi.id} className="hover:bg-slate-50/70 transition-colors">
                       <td className="px-6 py-5">
                         <div className="flex items-start">
                           <div className={`mt-0.5 p-2 rounded-lg shrink-0 mr-4 ${materi.fileName.endsWith('.pdf') ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                             <FileIcon className="w-5 h-5" />
                           </div>
                           <div>
                             <h4 className="font-bold text-slate-800 line-clamp-1">{materi.title}</h4>
                             <p className="text-sm text-slate-500 mt-1 line-clamp-1">{materi.description}</p>
                             <p className="text-xs font-medium mt-2 text-slate-400">{materi.fileName}</p>
                           </div>
                         </div>
                       </td>
                       <td className="px-6 py-5 text-center px-4">
                         <span className="text-sm font-medium text-slate-500">{materi.uploadDate}</span>
                       </td>
                       <td className="px-6 py-5 text-right space-x-2">
                         <button 
                           onClick={() => handleEdit(materi)}
                           className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors inline-flex group"
                           title="Edit Materi"
                         >
                           <Edit2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                         </button>
                         <button 
                           onClick={() => handleDelete(materi.id)}
                           className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors inline-flex group"
                           title="Hapus Materi"
                         >
                           <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-[60] animate-in slide-in-from-bottom-5">
          <div className="bg-slate-800 shadow-xl border border-slate-700 rounded-xl px-5 py-4 flex items-center space-x-3">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <span className="font-medium text-sm text-white">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function SaveIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/>
      <polyline points="7 3 7 8 15 8"/>
    </svg>
  );
}

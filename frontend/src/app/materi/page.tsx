"use client";

import React, { useState } from 'react';
import { Presentation, Download, Calendar, FileText, CheckCircle2, Eye, X, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Material {
  id: string;
  title: string;
  description: string;
  uploadDate: string;
  fileName: string;
  fileDataUrl?: string;
}

const materiPembelajaran: Material[] = [
  {
    id: "m01",
    title: "Bab 1: Pengenalan Hiragana Dasar",
    description: "Materi dasar pengenalan huruf Hiragana, meliputi cara penulisan, dan pelafalan dasar bagi pemula.",
    uploadDate: "2024-03-01",
    fileName: "Bab_1_Hiragana_Dasar.pptx"
  },
  {
    id: "m02",
    title: "Bab 2: Pengenalan Katakana Dasar",
    description: "Panduan lengkap huruf Katakana untuk penulisan kata serapan bahasa asing ke dalam bahasa Jepang.",
    uploadDate: "2024-03-05",
    fileName: "Bab_2_Katakana_Dasar.pptx"
  },
  {
    id: "m03",
    title: "Bab 3: Salam dan Sapaan (Aisatsu)",
    description: "Kumpulan salam dan sapaan sehari-hari dalam budaya Jepang untuk di lingkungan profesional.",
    uploadDate: "2024-03-10",
    fileName: "Bab_3_Aisatsu_Sapaan.pdf"
  },
  {
    id: "m04",
    title: "Bab 4: Perkenalan Diri (Jikoshoukai)",
    description: "Cara dan etika memperkenalkan diri dengan sopan di depan rekan kerja atau atasan baru.",
    uploadDate: "2024-03-15",
    fileName: "Bab_4_Jikoshoukai.pdf"
  },
  {
    id: "m05",
    title: "Bab 5: Kata Kerja Golongan 1, 2, dan 3",
    description: "Klasifikasi kata kerja bahasa Jepang ke dalam tiga golongan utama untuk perubahan bentuk (conjugation).",
    uploadDate: "2024-03-20",
    fileName: "Bab_5_Kata_Kerja_Golongan.pdf"
  },
  {
    id: "m06",
    title: "Bab 6: Perubahan Bentuk -Te (Te-Form)",
    description: "Materi perubahan kata kerja ke bentuk -te untuk menyatakan hubungan sebab-akibat, permintaan sopan, dan aksi beruntun.",
    uploadDate: "2024-03-25",
    fileName: "Bab_6_Bentuk_Te_Form.pptx"
  },
  {
    id: "m07",
    title: "Bab 7: Kata Sifat Golongan -I dan -Na",
    description: "Perbedaan mendasar antara kata sifat -i dan kata sifat -na serta cara memodifikasi kata benda.",
    uploadDate: "2024-03-28",
    fileName: "Bab_7_Kata_Sifat.pdf"
  },
  {
    id: "m08",
    title: "Bab 8: Struktur Kalimat Dasar (SOV)",
    description: "Pola penyusunan kalimat sederhana menggunakan Subjek, Objek, dan Kata Kerja (Verb).",
    uploadDate: "2024-04-01",
    fileName: "Bab_8_Struktur_Kalimat.pptx"
  },
  {
    id: "m09",
    title: "Bab 9: Penunjukan Jam dan Menit (Jikan)",
    description: "Cara menanyakan dan menginformasikan jam serta menit beserta pengecualian pelafalan angka.",
    uploadDate: "2024-04-05",
    fileName: "Bab_9_Waktu_Jikan.pdf"
  },
  {
    id: "m10",
    title: "Bab 10: Hari, Tanggal, dan Bulan (Koyomi)",
    description: "Penguasaan nama-nama hari, tanggal-tanggal khusus dalam satu bulan, dan nama bulan dalam setahun.",
    uploadDate: "2024-04-08",
    fileName: "Bab_10_Kalender.pdf"
  },
  {
    id: "m11",
    title: "Bab 11: Kata Depan dan Penunjuk Lokasi",
    description: "Penggunaan kosakata posisi seperti atas, bawah, dalam, luar, depan, dan belakang dalam kalimat.",
    uploadDate: "2024-04-12",
    fileName: "Bab_11_Penunjuk_Lokasi.pptx"
  },
  {
    id: "m12",
    title: "Bab 12: Pengenalan Kanji Dasar (50 Karakter N5)",
    description: "Pengenalan coretan kanji dasar tingkat pemula beserta cara baca Onyomi dan Kunyomi.",
    uploadDate: "2024-04-15",
    fileName: "Bab_12_Kanji_Dasar_N5.pdf"
  }
];

export default function MateriPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewingMateri, setViewingMateri] = useState<Material | null>(null);
  const [storedMateri, , isClient] = useLocalStorage<Material[]>("kndi_materi", materiPembelajaran);

  const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleDownload = (materi: Material) => {
    if (materi.fileDataUrl) {
      const link = document.createElement("a");
      link.href = materi.fileDataUrl;
      link.download = materi.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setToastMessage(`Berhasil mengunduh file: ${materi.fileName}`);
      setTimeout(() => setToastMessage(null), 4000);
    } else {
      setToastMessage(`Mensimulasikan unduhan untuk: ${materi.fileName}... (Data dummy)`);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  if (!isClient) return <div className="p-6 h-screen w-full" />; // Hydration guard

  // Sort logic by date
  const sortedMateri = [...storedMateri].sort((a, b) => {
    const timeA = new Date(a.uploadDate).getTime();
    const timeB = new Date(b.uploadDate).getTime();
    return sortBy === "latest" ? timeB - timeA : timeA - timeB;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedMateri.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMateri = sortedMateri.slice(startIndex, startIndex + itemsPerPage);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as "latest" | "oldest");
    setCurrentPage(1);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Materi Pembelajaran</h1>
        <p className="text-slate-600">
          Akses dan pelajari materi presentasi atau PDF secara mandiri langsung dari browser Anda.
        </p>
      </div>

      {/* Filter and Sort Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="text-sm text-slate-500 font-medium">
          Menampilkan <span className="font-bold text-slate-800">{Math.min(startIndex + 1, sortedMateri.length)}-{Math.min(startIndex + itemsPerPage, sortedMateri.length)}</span> dari <span className="font-bold text-slate-800">{sortedMateri.length}</span> materi
        </div>
        
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="w-full sm:w-auto text-sm bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer font-medium"
          >
            <option value="latest">Tanggal Upload: Terbaru</option>
            <option value="oldest">Tanggal Upload: Terlama</option>
          </select>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedMateri.map((materi) => (
          <div 
            key={materi.id} 
            className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 flex flex-col h-full"
          >
            <div className="p-5 flex-grow flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl transition-colors duration-300 group-hover:text-white ${
                  materi.fileName.endsWith('.pdf') 
                    ? 'bg-rose-50 text-rose-600 group-hover:bg-rose-600'
                    : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600'
                }`}>
                  {materi.fileName.endsWith('.pdf') ? <FileText className="h-6 w-6" /> : <Presentation className="h-6 w-6" />}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {materi.title}
              </h3>
              
              <p className="text-slate-600 text-sm mb-5 line-clamp-3 flex-grow">
                {materi.description}
              </p>
              
              <div className="flex flex-col space-y-2 mt-auto">
                <div className="flex items-center text-xs text-slate-500 font-medium">
                  <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                  <span>{formatDate(materi.uploadDate)}</span>
                </div>
                <div className="flex items-center text-xs text-slate-500 font-medium">
                  <FileText className="h-4 w-4 mr-2 text-slate-400" />
                  <span className="truncate" title={materi.fileName}>{materi.fileName}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 mt-auto grid grid-cols-2 gap-3">
              <button
                onClick={() => setViewingMateri(materi)}
                className="w-full flex items-center justify-center space-x-1.5 bg-blue-600 text-white hover:bg-blue-700 font-semibold py-2.5 px-3 rounded-lg transition-colors duration-300 active:scale-95 cursor-pointer text-sm shadow-sm"
              >
                <Eye className="h-4 w-4" />
                <span>Lihat</span>
              </button>
              <button
                onClick={() => handleDownload(materi)}
                className="w-full flex items-center justify-center space-x-1.5 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-800 font-semibold py-2.5 px-3 rounded-lg transition-colors duration-300 active:scale-95 cursor-pointer text-sm shadow-sm"
              >
                <Download className="h-4 w-4" />
                <span>Unduh</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center space-x-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Sebelumnya</span>
          </button>
          
          <div className="hidden sm:flex items-center space-x-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                  currentPage === page
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <span className="sm:hidden text-sm font-semibold text-slate-500">
            Halaman {currentPage} dari {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center space-x-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <span>Selanjutnya</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Viewer Modal */}
      {viewingMateri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 transition-opacity animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className={`p-2 rounded-lg shrink-0 ${
                  viewingMateri.fileName.endsWith('.pdf') ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {viewingMateri.fileName.endsWith('.pdf') ? <FileText className="h-5 w-5" /> : <Presentation className="h-5 w-5" />}
                </div>
                <div className="truncate pr-4">
                  <h3 className="font-bold text-slate-800 truncate">{viewingMateri.title}</h3>
                  <p className="text-xs text-slate-500 truncate">{viewingMateri.fileName}</p>
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

            {/* Modal Body - Document Simulator */}
            <div className="flex-1 bg-slate-100 p-4 sm:p-8 overflow-y-auto flex flex-col items-center justify-center relative">
               <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 pointer-events-none select-none">
                  {viewingMateri.fileName.endsWith('.pdf') ? (
                    <FileText className="w-32 h-32 text-slate-300 mb-4" />
                  ) : (
                    <Presentation className="w-32 h-32 text-slate-300 mb-4" />
                  )}
                  <p className="text-slate-400 font-bold text-xl uppercase tracking-widest">Mode Pratinjau Dokumen</p>
               </div>
               
               {viewingMateri.fileDataUrl && viewingMateri.fileName.endsWith('.pdf') ? (
                 <iframe 
                   src={viewingMateri.fileDataUrl} 
                   className="w-full h-full z-10 rounded-lg shadow-md border border-slate-200 bg-white"
                   title={viewingMateri.title}
                 />
               ) : (
                 <div className={`w-full max-w-3xl aspect-[4/3] bg-white shadow-md rounded-lg border border-slate-200 flex flex-col items-center justify-center z-10 p-8 sm:p-12 text-center relative overflow-hidden`}>
                     <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />
                     <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-6 leading-tight">{viewingMateri.title}</h2>
                     <p className="text-slate-600 text-lg sm:text-xl mb-8 max-w-2xl">{viewingMateri.description}</p>
                     
                     <div className="mt-auto pt-8 border-t border-slate-100 w-full flex justify-between text-sm font-semibold text-slate-400">
                       <span>© PT Kyodo News Digital Indonesia</span>
                       <span>Hal. 1 / 12</span>
                     </div>
                 </div>
               )}
            </div>
            
            {/* Modal Footer actions */}
            <div className="bg-white px-6 py-4 border-t border-slate-100 flex justify-between items-center shrink-0">
               <div className="text-sm font-medium text-slate-500 hidden sm:block">
                 Diunggah pada: <span className="text-slate-700">{formatDate(viewingMateri.uploadDate)}</span>
               </div>
               <div className="flex space-x-3 w-full sm:w-auto">
                 <button 
                   onClick={() => {
                     handleDownload(viewingMateri);
                     setViewingMateri(null);
                   }}
                   className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-5 py-2.5 rounded-lg font-semibold transition-colors active:scale-95"
                 >
                   <Download className="w-4 h-4" />
                   <span>Unduh Dokumen</span>
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-[60]">
          <div className="bg-slate-800 shadow-xl rounded-xl px-5 py-4 flex items-center space-x-3 transform transition-all translate-y-0 opacity-100">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <span className="font-medium text-sm text-white">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
        Selamat Datang di <span className="text-indigo-600">KNDI E-Learning</span>
      </h1>
      <p className="text-slate-500 max-w-xl text-lg mb-8">
        Platform pelatihan bahasa Jepang internal untuk karyawan PT Kyodo News Digital Indonesia. Silakan pilih menu di sidebar untuk memulai.
      </p>
    </div>
  );
}

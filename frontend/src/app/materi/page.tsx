"use client";

import React, { useState } from 'react';
import { Presentation, Download, Calendar, FileText, CheckCircle2, Eye, X, ChevronLeft, ChevronRight, ArrowUpDown, Search } from 'lucide-react';
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Material {
  id: string;
  title: string;
  description: string;
  uploadDate: string;
  fileName: string;
  fileDataUrl?: string;
}

interface Slide {
  title: string;
  content: string[];
  notes?: string;
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

const pptSlides: Record<string, Slide[]> = {
  "m01": [
    {
      title: "Bab 1: Pengenalan Hiragana Dasar",
      content: [
        "Pembelajaran Bahasa Jepang Tingkat Dasar",
        "Modul 1: Pengenalan Huruf Hiragana (ひらがな)",
        "Oleh: Sensei Taro",
        "PT Kyodo News Digital Indonesia"
      ],
      notes: "Slide pembuka untuk materi pengenalan Hiragana."
    },
    {
      title: "Apa itu Hiragana?",
      content: [
        "• Huruf dasar untuk mengeja kata asli bahasa Jepang.",
        "• Digunakan juga untuk partikel tata bahasa (joshi).",
        "• Terdiri dari 46 karakter standar (gojuuon).",
        "• Karakter hiragana berbentuk meliuk-liuk (kurva)."
      ],
      notes: "Penjelasan umum mengenai asal-usul dan kegunaan huruf Hiragana."
    },
    {
      title: "Huruf Vokal Dasar (Gojuon)",
      content: [
        "あ (a)  •  い (i)  •  う (u)  •  え (e)  •  お (o)",
        "Cobalah melafalkan huruf vokal dengan benar:",
        "- あ (A) : seperti 'a' pada kata 'ada'",
        "- い (I) : seperti 'i' pada kata 'ibu'",
        "- う (U) : seperti 'u' pada kata 'ular'",
        "- え (E) : seperti 'e' pada kata 'ekor'",
        "- お (O) : seperti 'o' pada kata 'obat'"
      ],
      notes: "Kelompok vokal dasar adalah pondasi pelafalan seluruh huruf Jepang."
    },
    {
      title: "Huruf Konsonan K (Ka-Ki-Ku-Ke-Ko)",
      content: [
        "か (ka)  •  き (ki)  •  く (ku)  •  け (ke)  •  こ (ko)",
        "Contoh kosakata sederhana:",
        "- かさ (Kasa) : Payung",
        "- あき (Aki) : Musim Gugur",
        "- こえ (Koe) : Suara"
      ],
      notes: "Penulisan garis horizontal dimulai terlebih dahulu sebelum garis vertikal."
    },
    {
      title: "Latihan Menulis & Membaca",
      content: [
        "• Ambil buku kotak-kata untuk latihan menulis.",
        "• Perhatikan urutan goresan (stroke order) tiap huruf.",
        "• Bacalah kata berikut keras-keras:",
        "  1. あい (Ai) - Cinta",
        "  2. いえ (Ie) - Rumah",
        "  3. かく (Kaku) - Menulis"
      ],
      notes: "Minta siswa untuk mengerjakan latihan mandiri di lembar kerja N5."
    }
  ],
  "m02": [
    {
      title: "Bab 2: Pengenalan Katakana Dasar",
      content: [
        "Pembelajaran Bahasa Jepang Tingkat Dasar",
        "Modul 2: Pengenalan Huruf Katakana (カタカナ)",
        "Oleh: Sensei Taro",
        "PT Kyodo News Digital Indonesia"
      ],
      notes: "Slide pembuka untuk materi Katakana."
    },
    {
      title: "Fungsi Huruf Katakana",
      content: [
        "• Menulis kata serapan dari bahasa asing (gairaigo).",
        "• Menulis nama orang asing atau negara non-Jepang.",
        "• Menulis nama hewan, tumbuhan, atau onomatope.",
        "• Karakter Katakana berbentuk kaku dan bersudut tajam."
      ],
      notes: "Katakana sangat penting untuk adaptasi kosakata modern (misal: komputer, internet)."
    },
    {
      title: "Huruf Vokal Katakana",
      content: [
        "ア (a)  •  イ (i)  •  ウ (u)  •  エ (e)  •  オ (o)",
        "Perbandingan Hiragana vs Katakana:",
        "あ -> ア",
        "い -> イ",
        "う -> ウ",
        "え -> エ",
        "お -> オ"
      ],
      notes: "Pelafalan sama persis dengan vokal Hiragana, hanya bentuk goresan yang berbeda."
    },
    {
      title: "Kata Serapan Populer (Gairaigo)",
      content: [
        "Mari membaca kata serapan berikut:",
        "• テレビ (Terebi) : Televisi",
        "• カメラ (Kamera) : Kamera",
        "• コーヒー (Koohii) : Kopi (vokal panjang)",
        "• ノート (Nooto) : Catatan (notebook)"
      ],
      notes: "Tanda garis mendatar 'ー' menandakan vokal panjang pada Katakana."
    },
    {
      title: "Latihan Membaca Katakana",
      content: [
        "Terjemahkan kata Katakana berikut ke bahasa Indonesia:",
        "1. アメリカ (Amerika)",
        "2. トイレ (Toire)",
        "3. パン (Pan)",
        "4. シャツ (Shatsu)"
      ],
      notes: "Kunci: 1. Amerika, 2. Toilet, 3. Roti, 4. Kemeja."
    }
  ],
  "m03": [
    {
      title: "Bab 3: Salam dan Sapaan (Aisatsu)",
      content: [
        "Dokumen PDF Pembelajaran - Halaman 1",
        "Materi Penting: Aisatsu (あいさつ) - Salam Sopan Jepang",
        "Penting digunakan dalam dunia kerja dan keseharian."
      ]
    },
    {
      title: "Salam Pagi & Siang Hari",
      content: [
        "• おはようございます (Ohayou Gozaimasu) - Selamat Pagi",
        "  - Digunakan hingga pukul 10:00 atau saat pertama bertemu rekan kerja.",
        "• こんにちは (Konnichiwa) - Selamat Siang/Halo",
        "  - Digunakan secara luas dari siang hingga sore hari."
      ]
    },
    {
      title: "Salam Malam & Istirahat",
      content: [
        "• こんばんは (Konbanwa) - Selamat Malam",
        "  - Digunakan saat hari mulai gelap.",
        "• おやすみなさい (Oyasuminasai) - Selamat Tidur/Malam",
        "  - Digunakan sebelum tidur atau berpisah untuk istirahat malam."
      ]
    },
    {
      title: "Mengucapkan Terima Kasih & Minta Maaf",
      content: [
        "• ありがとうございます (Arigatou Gozaimasu) - Terima Kasih Banyak",
        "• すみません (Sumimasen) - Maaf / Permisi",
        "  - Berfungsi ganda untuk menarik perhatian atau memohon maaf secara sopan."
      ]
    },
    {
      title: "Salam Perpisahan",
      content: [
        "• さようなら (Sayounara) - Selamat Tinggal (jarang dipakai jika akan bertemu lagi)",
        "• では、また / じゃ、また (Dewa mata / Ja mata) - Sampai Jumpa Lagi",
        "• お先に失礼します (Osaki ni shitsurei shimasu) - Permisi pulang duluan"
      ]
    }
  ],
  "m04": [
    {
      title: "Bab 4: Perkenalan Diri (Jikoshoukai)",
      content: [
        "Dokumen PDF Pembelajaran - Halaman 1",
        "Panduan Praktis Jikoshoukai (自己紹介) bagi Profesional",
        "Membantu Anda membuat kesan pertama yang mengesankan."
      ]
    },
    {
      title: "Langkah 1: Salam Pembuka",
      content: [
        "• Mulailah dengan kata pembuka wajib:",
        "  Hajimemashite (はじめまして)",
        "  Artinya: 'Perkenalkan/Senang bertemu dengan Anda untuk pertama kali.'"
      ]
    },
    {
      title: "Langkah 2: Nama & Identitas",
      content: [
        "• Menyebutkan nama lengkap/panggilan:",
        "  [Nama] to moushimasu. (Formal/Sopan)",
        "  [Nama] desu. (Netral)",
        "• Menyebutkan asal negara/organisasi:",
        "  Indonesia kara kimashita. (Saya datang dari Indonesia)"
      ]
    },
    {
      title: "Langkah 3: Salam Penutup",
      content: [
        "• Akhiri dengan permohonan kerjasama yang erat:",
        "  Douzo yoroshiku onegaishimasu. (どうぞよろしくおねがいします)",
        "  Artinya: 'Mohon bimbingan dan kerjasamanya.'"
      ]
    },
    {
      title: "Contoh Teks Jikoshoukai Lengkap",
      content: [
        "\"Hajimemashite. Watashi wa Budi desu.",
        "Indonesia no Jakarta kara kimashita.",
        "KNDI no software engineer desu.",
        "Douzo yoroshiku onegaishimasu.\""
      ]
    }
  ],
  "m05": [
    {
      title: "Bab 5: Golongan Kata Kerja Jepang",
      content: [
        "Dokumen PDF Pembelajaran - Halaman 1",
        "Pengelompokan Kata Kerja (Doushi) ke Golongan 1, 2, dan 3",
        "Sangat krusial untuk mempelajari bentuk tata bahasa selanjutnya."
      ]
    },
    {
      title: "Golongan 1 (Godan Doushi)",
      content: [
        "• Kata kerja dengan akhiran huruf vokal -u pada bentuk kamus.",
        "• Contoh:",
        "  - 書く (Kaku) - Menulis",
        "  - 読む (Yomu) - Membaca",
        "  - 買う (Kau) - Membeli",
        "  - 待つ (Matsu) - Menunggu"
      ]
    },
    {
      title: "Golongan 2 (Ichidan Doushi)",
      content: [
        "• Kata kerja dengan akhiran -iru atau -eru pada bentuk kamus.",
        "• Contoh:",
        "  - 食べる (Taberu) - Makan",
        "  - 見る (Miru) - Melihat",
        "  - 起きる (Okiru) - Bangun",
        "  - 寝る (Neru) - Tidur"
      ]
    },
    {
      title: "Golongan 3 (Kousoku / Irregular)",
      content: [
        "• Hanya terdiri dari dua kata kerja utama:",
        "  - する (Suru) - Melakukan",
        "  - 来る (Kuru) - Datang",
        "• Serta kata kerja majemuk berakhiran ~suru (contoh: Benkyou suru)."
      ]
    }
  ],
  "m06": [
    {
      title: "Bab 6: Perubahan Bentuk -Te (Te-Form)",
      content: [
        "Tata Bahasa Level N5",
        "Modul 6: Cara Mengubah Kata Kerja ke Bentuk -Te (-て形)",
        "Oleh: Sensei Taro",
        "PT Kyodo News Digital Indonesia"
      ]
    },
    {
      title: "Apa itu Bentuk -Te?",
      content: [
        "• Bentuk konjugasi kata kerja penunjuk hubungan kronologis.",
        "• Digunakan untuk menyambung dua kalimat atau lebih.",
        "• Digunakan untuk instruksi/permintaan sopan (...てください).",
        "• Menunjukkan aksi yang sedang berlangsung (...ています)."
      ]
    },
    {
      title: "Perubahan Kata Kerja Golongan 1 (Godan)",
      content: [
        "Berdasarkan akhiran bentuk kamus (dictionary form):",
        "• -u, -tsu, -ru  ->  ~tte (Matsu -> Matte, Kau -> Katte)",
        "• -mu, -bu, -nu  ->  ~nde (Yomu -> Yonde, Asobu -> Asonde)",
        "• -ku -> ~ite (Kaku -> Kaite) *Pengecualian: Iku -> Itte",
        "• -gu -> ~ide (Oyogu -> Oyoide)",
        "• -su -> ~shite (Hanasu -> Hanashite)"
      ]
    },
    {
      title: "Perubahan Golongan 2 & 3",
      content: [
        "Golongan 2 (Ichidan): Akhiran -iru / -eru",
        "• Tinggal hilangkan -ru dan tambahkan -te",
        "  - Taberu  ->  Tabete (Makan)",
        "  - Miru  ->  Mite (Melihat)",
        "",
        "Golongan 3 (Irregular):",
        "• Suru  ->  Shite (Melakukan)",
        "• Kuru  ->  Kite (Datang)"
      ]
    },
    {
      title: "Contoh Kalimat Penggunaan",
      content: [
        "1. Silakan tunggu sebentar.",
        "   Chotto matte kudasai. (待ってください)",
        "2. Saya sedang makan roti.",
        "   Watashi wa pan o tabete imasu. (パンを食べています)",
        "3. Membuka buku lalu membaca.",
        "   Hon o akete, yomimasu. (本を開けて、読みます)"
      ]
    }
  ],
  "m07": [
    {
      title: "Bab 7: Kata Sifat Golongan -I dan -Na",
      content: [
        "Dokumen PDF Pembelajaran - Halaman 1",
        "Pengenalan Kata Sifat (Keiyoushi) N5",
        "Mempelajari pembagian kata sifat dan modifikasi kata benda."
      ]
    },
    {
      title: "Kata Sifat -I (I-Keiyoushi)",
      content: [
        "• Kata sifat asli yang berakhiran dengan karakter Hiragana 'い' (i).",
        "• Contoh:",
        "  - 高い (Takai) - Mahal / Tinggi",
        "  - 美味しい (Oishii) - Lezat",
        "  - 寒い (Samui) - Dingin (cuaca)",
        "  - 新しい (Atarashii) - Baru"
      ]
    },
    {
      title: "Kata Sifat -Na (Na-Keiyoushi)",
      content: [
        "• Kata sifat berakhiran bebas, tetapi membutuhkan partikel 'na' sebelum kata benda.",
        "• Contoh:",
        "  - 静か [な] (Shizuka [na]) - Tenang/Sunyi",
        "  - 親切 [な] (Shinsetsu [na]) - Ramah/Baik hati",
        "  - 綺麗 [な] (Kirei [na]) - Cantik/Bersih (Meskipun berakhiran 'i')"
      ]
    },
    {
      title: "Penggabungan dengan Kata Benda",
      content: [
        "• Kata Sifat -i langsung menempel:",
        "  Oishii tabemono (Makanan lezat)",
        "• Kata Sifat -na membutuhkan partikel 'na':",
        "  Shizuka na heya (Kamar yang tenang)"
      ]
    }
  ],
  "m08": [
    {
      title: "Bab 8: Struktur Kalimat Dasar (SOV)",
      content: [
        "Tata Bahasa Level N5",
        "Modul 8: Pola Kalimat Subjek - Objek - Kata Kerja",
        "Oleh: Sensei Taro",
        "PT Kyodo News Digital Indonesia"
      ]
    },
    {
      title: "Perbedaan Struktur Kalimat",
      content: [
        "Bahasa Indonesia / Inggris (SPO / SVO):",
        "• Saya (S) makan (P) apel (O)",
        "",
        "Bahasa Jepang (SOP / SOV):",
        "• Watashi wa (S) ringo o (O) tabemasu (V)",
        "• Kata kerja SELALU diletakkan di AKHIR kalimat."
      ]
    },
    {
      title: "Peran Partikel は (wa) dan を (o)",
      content: [
        "• Partikel は (wa) :",
        "  - Menandai topik atau subjek utama pembicaraan.",
        "  - Ditulis dengan hiragana 'ha' tapi dibaca 'wa'.",
        "• Partikel を (o) :",
        "  - Menandai objek langsung yang terkena kata kerja.",
        "  - Ditulis dengan hiragana 'wo' tapi dibaca 'o'."
      ]
    },
    {
      title: "Contoh Penyusunan Kalimat",
      content: [
        "1. Saya minum kopi.",
        "   Watashi wa koohii o nomimasu. (私はコーヒーを飲みます)",
        "2. Ken membaca buku.",
        "   Ken-san wa hon o yomimasu. (ケンさんは本を読みます)",
        "3. Ibu membeli sayur.",
        "   Okaasan wa yasai o kaimasu. (お母さんは野菜を買います)"
      ]
    },
    {
      title: "Latihan Mandiri",
      content: [
        "Susunlah kata acak ini menjadi kalimat SOP Jepang:",
        "• [sakana o] [tabemasu] [neko wa]",
        "  -> Kucing makan ikan.",
        "• Jawaban: Neko wa sakana o tabemasu. (猫は魚を食べます)"
      ]
    }
  ],
  "m09": [
    {
      title: "Bab 9: Penunjukan Jam dan Menit",
      content: [
        "Dokumen PDF Pembelajaran - Halaman 1",
        "Menyatakan Waktu (Jikan) dalam Bahasa Jepang",
        "Memahami jam (ji), menit (fun/pun), dan menanyakan waktu."
      ]
    },
    {
      title: "Menyebutkan Jam (~ji)",
      content: [
        "• Rumus: [Angka] + 時 (ji)",
        "• Perhatikan pelafalan khusus (irregular):",
        "  - 4:00 -> よじ (yoji) [bukan yonji]",
        "  - 7:00 -> しちじ (shichiji) [bukan nanaji]",
        "  - 9:00 -> くじ (kuji) [bukan kyuuji]"
      ]
    },
    {
      title: "Menyebutkan Menit (~fun / ~pun)",
      content: [
        "• Akhiran menit menyesuaikan dengan angka di depannya:",
        "  - 1 menit -> いっぷん (ippun)",
        "  - 3 menit -> さんぷん (sanpun)",
        "  - 5 menit -> ごふん (gofun)",
        "  - 10 menit -> じゅっぷん (juppun)",
        "  - 30 menit / Setengah -> 半 (han)"
      ]
    },
    {
      title: "Menanyakan Waktu & Contoh",
      content: [
        "• Sekarang jam berapa?",
        "  Ima nan-ji desu ka. (今何時ですか)",
        "• Sekarang jam 8 lewat 30 menit / setengah 9.",
        "  Ima hachi-ji han desu. (今八時半です)"
      ]
    }
  ],
  "m10": [
    {
      title: "Bab 10: Hari, Tanggal, dan Bulan",
      content: [
        "Dokumen PDF Pembelajaran - Halaman 1",
        "Penguasaan Sistem Kalender Jepang (Koyomi)",
        "Sangat penting untuk janji temu (yakusoku) dan jadwal kerja."
      ]
    },
    {
      title: "Menyebutkan Hari (~youbi)",
      content: [
        "• 月曜日 (Getsuyoubi) - Senin (Bulan)",
        "• 火曜日 (Kayoubi) - Selasa (Api)",
        "• 水曜日 (Suiyoubi) - Rabu (Air)",
        "• 木曜日 (Mokuyoubi) - Kamis (Pohon)",
        "• 金曜日 (Kinyoubi) - Jumat (Logam/Uang)",
        "• 土曜日 (Doyoubi) - Sabtu (Tanah)",
        "• 日曜日 (Nichiyoubi) - Minggu (Matahari)"
      ]
    },
    {
      title: "Penyebutan Bulan (~gatsu)",
      content: [
        "• Cukup sebutkan [Angka 1-12] + 月 (gatsu)",
        "• Catatan khusus:",
        "  - April -> しがつ (Shigatsu) [bukan yongatsu]",
        "  - Juli -> しちがつ (Shichigatsu) [bukan nanagatsu]",
        "  - September -> くがつ (Kugatsu) [bukan kyuugatsu]"
      ]
    }
  ],
  "m11": [
    {
      title: "Bab 11: Kata Depan & Penunjuk Lokasi",
      content: [
        "Kosakata & Percakapan N5",
        "Modul 11: Menunjukkan Letak Benda dan Arah",
        "Oleh: Sensei Taro",
        "PT Kyodo News Digital Indonesia"
      ]
    },
    {
      title: "Daftar Kosakata Posisi Utama",
      content: [
        "• 上 (ue)  : Atas",
        "• 下 (shita) : Bawah",
        "• 中 (naka)  : Dalam",
        "• 外 (soto)  : Luar",
        "• 前 (mae)   : Depan",
        "• 后ろ (ushiro) : Belakang",
        "• 隣 (tonari) : Sebelah/Samping"
      ]
    },
    {
      title: "Pola Kalimat Keberadaan Benda (Aru)",
      content: [
        "Struktur kalimat penunjuk letak benda mati:",
        "• [Tempat] no [Posisi] ni [Benda] ga arimasu.",
        "",
        "Contoh:",
        "• Di atas meja ada buku.",
        "  Tsukue no ue ni hon ga arimasu. (机の上に本があります)",
        "• Di dalam tas ada kunci.",
        "  Kaban no naka ni kagi ga arimasu. (鞄の中に鍵があります)"
      ]
    },
    {
      title: "Pola Kalimat Keberadaan Makhluk Hidup (Iru)",
      content: [
        "Struktur kalimat untuk manusia atau hewan:",
        "• [Tempat] no [Posisi] ni [Subjek] ga imasu.",
        "",
        "Contoh:",
        "• Di depan stasiun ada Sensei.",
        "  Eki no mae ni sensei ga imasu. (駅の前に先生がいます)",
        "• Di bawah pohon ada kucing.",
        "  Ki no shita ni neko ga imasu. (木の下に猫がいます)"
      ]
    },
    {
      title: "Latihan Lokasi",
      content: [
        "Terjemahkan ke dalam bahasa Jepang:",
        "1. Kunci ada di sebelah komputer.",
        "   -> Pasokon no tonari ni kagi ga arimasu.",
        "2. Anjing ada di luar rumah.",
        "   -> Uchi no soto ni inu ga imasu."
      ]
    }
  ],
  "m12": [
    {
      title: "Bab 12: Pengenalan Kanji Dasar",
      content: [
        "Dokumen PDF Pembelajaran - Halaman 1",
        "Belajar Kanji Dasar Level JLPT N5",
        "Memahami ideogram bergambar (piktograf) beserta cara bacanya."
      ]
    },
    {
      title: "Kanji Angka Dasar",
      content: [
        "• 一 (ichi/hito) - Satu",
        "• 二 (ni/futa) - Dua",
        "• 三 (san/mi) - Tiga",
        "• 四 (shi/yon) - Empat",
        "• 五 (go/itsu) - Lima",
        "• 六 (roku/mu) - Enam",
        "• 七 (shichi/nana) - Tujuh",
        "• 八 (hachi/ya) - Delapan",
        "• 九 (kyuu/ku) - Sembilan",
        "• 十 (juu/too) - Sepuluh"
      ]
    },
    {
      title: "Kanji Alam dan Unsur",
      content: [
        "• 日 (hi/nichi) - Matahari / Hari",
        "• 月 (tsuki/getsu) - Bulan",
        "• 火 (hi/ka) - Api",
        "• 水 (mizu/sui) - Air",
        "• 木 (ki/moku) - Pohon / Kayu",
        "• 金 (kane/kin) - Uang / Emas",
        "• 土 (tsuchi/to) - Tanah",
        "• 山 (yama/san) - Gunung",
        "• 川 (kawa/sen) - Sungai"
      ]
    }
  ]
};

export default function MateriPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewingMateri, setViewingMateri] = useState<Material | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [storedMateri, , isClient] = useLocalStorage<Material[]>("kndi_materi", materiPembelajaran);

  const [searchQuery, setSearchQuery] = useState("");
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

  const handleViewMateri = (materi: Material) => {
    setViewingMateri(materi);
    setCurrentSlideIndex(0);
  };

  if (!isClient) return <div className="p-6 h-screen w-full" />; // Hydration guard

  // Filter logic: search by title or description
  const filteredMateri = storedMateri.filter((materi) =>
    materi.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    materi.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort logic by date
  const sortedMateri = [...filteredMateri].sort((a, b) => {
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

  const getSlides = (materi: Material): Slide[] => {
    if (pptSlides[materi.id]) {
      return pptSlides[materi.id];
    }
    // Dynamic slides for custom uploaded files (PPTX, PPT, or simulated PDFs)
    return [
      {
        title: materi.title,
        content: [
          "Materi Pembelajaran Tambahan",
          `File: ${materi.fileName}`,
          "Diunggah oleh Sensei",
          "PT Kyodo News Digital Indonesia"
        ],
        notes: "Slide pembuka dokumen."
      },
      {
        title: "Deskripsi Materi",
        content: [
          materi.description || "Tidak ada deskripsi tambahan untuk materi ini.",
          "",
          "Gunakan navigasi di bawah untuk melihat ringkasan atau unduh file lengkapnya."
        ],
        notes: "Slide ringkasan deskripsi materi."
      },
      {
        title: "Siap Diunduh!",
        content: [
          "Dokumen ini siap Anda pelajari secara luring.",
          "Silakan klik tombol 'Unduh Dokumen' di bawah untuk:",
          "- Membuka file secara penuh menggunakan aplikasi penampil lokal.",
          "- Menyimpan materi sebagai referensi belajar Anda."
        ],
        notes: "Slide informasi unduhan."
      }
    ];
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
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        {/* Search Bar */}
        <div className="flex-grow flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:bg-white focus-within:border-indigo-400 transition-all">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Cari materi berdasarkan judul atau deskripsi..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Sort Date */}
          <div className="flex items-center space-x-2 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="bg-transparent border-none outline-none text-sm text-slate-700 font-medium cursor-pointer"
            >
              <option value="latest">Tanggal Upload: Terbaru</option>
              <option value="oldest">Tanggal Upload: Terlama</option>
            </select>
          </div>
          
          <div className="text-sm text-slate-500 font-medium self-center px-1">
            Total: <span className="font-bold text-slate-800">{sortedMateri.length}</span> materi
          </div>
        </div>
      </div>

      {/* Materials Grid or Empty State */}
      {sortedMateri.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 flex flex-col items-center justify-center text-center">
          <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-full mb-6 text-indigo-400">
            <Presentation className="w-12 h-12" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Materi Tidak Ditemukan</h3>
          <p className="text-slate-500 max-w-md pb-6 leading-relaxed">
            Tidak ditemukan materi yang sesuai dengan kata kunci pencarian Anda. Silakan coba kata kunci lain.
          </p>
        </div>
      ) : (
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
                  onClick={() => handleViewMateri(materi)}
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
      )}

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

            {/* Modal Body - Document Simulator or True PDF Iframe */}
            <div className="flex-1 bg-slate-100 p-4 sm:p-8 overflow-y-auto flex flex-col items-center justify-center relative">
               
               {/* Document Canvas (Page 1 Simulator, Slide View or True PDF iframe) */}
               {viewingMateri.fileDataUrl && viewingMateri.fileName.endsWith('.pdf') ? (
                 <iframe 
                   src={viewingMateri.fileDataUrl} 
                   className="w-full h-full z-10 rounded-lg shadow-md border border-slate-200 bg-white"
                   title={viewingMateri.title}
                 />
               ) : (
                 (() => {
                   const slides = getSlides(viewingMateri);
                   const isPdfFile = viewingMateri.fileName.endsWith('.pdf');
                   return (
                     <div className="w-full max-w-3xl aspect-[16/10] sm:aspect-[16/9] bg-white shadow-xl rounded-2xl border border-slate-200/60 flex flex-col z-10 p-6 sm:p-8 relative overflow-hidden group/slide">
                       {/* Top Slide Line Indicator */}
                       <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600" />
                       
                       {/* Slide Header */}
                       <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 shrink-0">
                         <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md tracking-wider uppercase">
                           {isPdfFile ? "Simulasi Dokumen PDF" : "Slide Presentasi PPTX"}
                         </span>
                         <span className="text-xs font-bold text-slate-400">
                           {isPdfFile ? "Halaman" : "Slide"} {currentSlideIndex + 1} dari {slides.length}
                         </span>
                       </div>

                       {/* Slide Content Body */}
                       <div className="flex-1 flex flex-col justify-center items-center text-center py-4 px-2 select-none overflow-y-auto">
                         <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-6 leading-snug">
                           {slides[currentSlideIndex].title}
                         </h2>
                         <div className="space-y-3 max-w-2xl text-left w-full mx-auto">
                           {slides[currentSlideIndex].content.map((line, idx) => (
                             <p key={idx} className={`text-slate-600 text-sm sm:text-base leading-relaxed ${line.startsWith('•') || line.startsWith('-') ? 'pl-4' : 'text-center font-medium'}`}>
                               {line}
                             </p>
                           ))}
                         </div>
                       </div>

                       {/* Slide Note (Footer area if exists) */}
                       {slides[currentSlideIndex].notes && (
                         <div className="mt-3 bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-500 italic text-left shrink-0">
                           💡 Catatan: {slides[currentSlideIndex].notes}
                         </div>
                       )}

                       {/* Bottom slide bar */}
                       <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
                         <button
                           onClick={() => setCurrentSlideIndex((prev) => Math.max(prev - 1, 0))}
                           disabled={currentSlideIndex === 0}
                           className="flex items-center space-x-1.5 px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                         >
                           <ChevronLeft className="w-4 h-4" />
                           <span>Sebelumnya</span>
                         </button>

                         <div className="hidden sm:flex space-x-1">
                           {slides.map((_, idx) => (
                             <div 
                               key={idx}
                               className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentSlideIndex ? 'w-5 bg-indigo-600' : 'bg-slate-200'}`}
                             />
                           ))}
                         </div>

                         <button
                           onClick={() => setCurrentSlideIndex((prev) => Math.min(prev + 1, slides.length - 1))}
                           disabled={currentSlideIndex === slides.length - 1}
                           className="flex items-center space-x-1.5 px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                         >
                           <span>Berikutnya</span>
                           <ChevronRight className="w-4 h-4" />
                         </button>
                       </div>
                     </div>
                   );
                 })()
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

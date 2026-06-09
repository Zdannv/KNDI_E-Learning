export type QuestionType = "multiple_choice" | "short_answer" | "matching" | "essay";

export type QuestionWeight = 1 | 2 | 3;

export interface QuestionBase {
  id: string;
  type: QuestionType;
  questionText: string;
  weight: QuestionWeight;
  imageUrl?: string;
  audioUrl?: string;
}

export interface MultipleChoiceOption {
  text: string;
  imageUrl?: string;
  audioUrl?: string;
}

export interface MultipleChoiceQuestion extends QuestionBase {
  type: "multiple_choice";
  options: [MultipleChoiceOption, MultipleChoiceOption, MultipleChoiceOption, MultipleChoiceOption];
  correctOptionIndex: number;
}

export interface ShortAnswerQuestion extends QuestionBase {
  type: "short_answer";
  correctAnswerText: string;
}

export interface EssayQuestion extends QuestionBase {
  type: "essay";
}

export type Question = MultipleChoiceQuestion | ShortAnswerQuestion | MatchingQuestion | EssayQuestion;

export interface MatchingContent {
  text: string;
  imageUrl?: string;
  audioUrl?: string;
}

export interface MatchingPair {
  id: string;
  leftContent: MatchingContent;
  rightContent: MatchingContent;
}

export interface MatchingQuestion extends QuestionBase {
  type: "matching";
  pairs: MatchingPair[];
}

export interface QuizData {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt?: string;
}

export interface QuizHistoryRecord {
  id: string;
  quizId: string;
  quizTitle: string;
  score: number;
  dateStr: string;
  timeStr: string;
  studentName?: string;
}

export const fallbackMockQuizzes: QuizData[] = [
  {
    id: "quiz-1",
    title: "Kuis Dasar 1: Kosakata Sehari-hari",
    description: "Uji pemahaman Anda tentang kosakata bahasa Jepang dasar sebelum melanjutkan ke bab berikutnya.",
    createdAt: "2024-03-01",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        questionText: "Apa arti rambu ini dalam bahasa Indonesia?",
        weight: 1,
        imageUrl: "https://placehold.co/600x400/ef4444/white?text=Tomare+(Berhenti)",
        options: [{ text: "Jalan Terus" }, { text: "Berhenti" }, { text: "Belok Kiri" }, { text: "Parkir" }],
        correctOptionIndex: 1, 
      },
      {
        id: "q2",
        type: "short_answer",
        questionText: "Dengarkan audio ini dan tulis apa yang Anda dengar.",
        weight: 1,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        correctAnswerText: "Musik", 
      },
      {
        id: "q3",
        type: "multiple_choice",
        questionText: "Mana yang merupakan buah apel?",
        weight: 1,
        options: [
          { text: "Pisang", imageUrl: "https://placehold.co/300x300/eab308/white?text=Pisang" },
          { text: "Apel", imageUrl: "https://placehold.co/300x300/ef4444/white?text=Apel" },
          { text: "Jeruk", imageUrl: "https://placehold.co/300x300/f97316/white?text=Jeruk" },
          { text: "Anggur", imageUrl: "https://placehold.co/300x300/8b5cf6/white?text=Anggur" }
        ],
        correctOptionIndex: 1, 
      },
      {
        id: "q4",
        type: "matching",
        questionText: "Pasangkan gambar buah berikut dengan ejaan bahasa Jepangnya yang tepat!",
        weight: 2,
        pairs: [
          { id: "p1", leftContent: { text: "Gambar Apel", imageUrl: "https://placehold.co/200x200/ef4444/white?text=Apel" }, rightContent: { text: "りんご (Ringo)" } },
          { id: "p2", leftContent: { text: "Gambar Pisang", imageUrl: "https://placehold.co/200x200/eab308/white?text=Pisang" }, rightContent: { text: "ばなな (Banana)" } },
          { id: "p3", leftContent: { text: "Gambar Jeruk", imageUrl: "https://placehold.co/200x200/f97316/white?text=Jeruk" }, rightContent: { text: "みかん (Mikan)" } },
          { id: "p4", leftContent: { text: "Gambar Anggur", imageUrl: "https://placehold.co/200x200/8b5cf6/white?text=Anggur" }, rightContent: { text: "ぶどう (Budou)" } }
        ]
      }
    ]
  },
  {
    id: "quiz-2",
    title: "Kuis Dasar 2: Hiragana & Katakana Lanjutan",
    description: "Uji kemampuan membaca dan menterjemahkan karakter Hiragana dan Katakana dalam kata-kata sederhana yang sering digunakan sehari-hari.",
    createdAt: "2024-03-05",
    questions: [
      { id: "q2_1", type: "multiple_choice", weight: 1, questionText: "Bagaimana cara membaca karakter hiragana 'くるま' (kuruma)?", options: [{ text: "Kereta" }, { text: "Mobil" }, { text: "Motor" }, { text: "Pesawat" }], correctOptionIndex: 1 },
      { id: "q2_2", type: "short_answer", weight: 1, questionText: "Tuliskan romaji (huruf latin) dari kata hiragana 'さくら' (huruf kecil semua).", correctAnswerText: "sakura" },
      { id: "q2_3", type: "multiple_choice", weight: 1, questionText: "Karakter Katakana manakah yang dibaca sebagai 'su'?", options: [{ text: "ス" }, { text: "シ" }, { text: "ツ" }, { text: "ソ" }], correctOptionIndex: 0 },
      { id: "q2_4", type: "short_answer", weight: 1, questionText: "Tuliskan terjemahan bahasa Indonesia untuk kata 'みず' (mizu).", correctAnswerText: "Air" },
      { id: "q2_5", type: "multiple_choice", weight: 1, questionText: "Bagaimana membaca huruf kanji/hiragana 'やま' (yama)?", options: [{ text: "Laut" }, { text: "Sungai" }, { text: "Gunung" }, { text: "Hutan" }], correctOptionIndex: 2 },
      { id: "q2_6", type: "short_answer", weight: 1, questionText: "Tuliskan romaji dari kata Katakana 'テレビ' (huruf kecil semua).", correctAnswerText: "terebi" },
      { id: "q2_7", type: "multiple_choice", weight: 1, questionText: "Apa arti dari bahasa serapan 'パン' (pan) dalam bahasa Indonesia?", options: [{ text: "Panci" }, { text: "Roti" }, { text: "Pena" }, { text: "Nasi" }], correctOptionIndex: 1 },
      { id: "q2_8", type: "short_answer", weight: 1, questionText: "Tuliskan romaji dari hiragana 'neko' (huruf kecil semua).", correctAnswerText: "neko" },
      { id: "q2_9", type: "multiple_choice", weight: 1, questionText: "Huruf Hiragana manakah yang dibaca sebagai 'chi'?", options: [{ text: "さ" }, { text: "ち" }, { text: "ら" }, { text: "き" }], correctOptionIndex: 1 },
      { id: "q2_10", type: "short_answer", weight: 1, questionText: "Tuliskan arti dari kata 'いぬ' (inu) dalam bahasa Indonesia.", correctAnswerText: "Anjing" }
    ]
  },
  {
    id: "quiz-3",
    title: "Kuis Dasar 3: Partikel dan Tata Bahasa Utama",
    description: "Evaluasi penguasaan Anda mengenai penggunaan partikel dasar seperti wa, ga, o, ni, dan de dalam penyusunan kalimat bahasa Jepang.",
    createdAt: "2024-03-10",
    questions: [
      { id: "q3_1", type: "multiple_choice", weight: 1, questionText: "Partikel apa yang sering digunakan semata-mata untuk menandai subjek topik dalam sebuah kalimat?", options: [{ text: "を (o)" }, { text: "ni (ni)" }, { text: "は (wa)" }, { text: "de (de)" }], correctOptionIndex: 2 },
      { id: "q3_2", type: "short_answer", weight: 1, questionText: "Watashi ___ gakusei desu. (Ketik satu kata romaji partikel yang melengkapi kalimat topik)", correctAnswerText: "wa" },
      { id: "q3_3", type: "multiple_choice", weight: 1, questionText: "Partikel apa yang digunakan untuk menandai sebuah objek langsung dari kata kerja tindakan?", options: [{ text: "が (ga)" }, { text: "を (o)" }, { text: "へ (e)" }, { text: "に (ni)" }], correctOptionIndex: 1 },
      { id: "q3_4", type: "short_answer", weight: 1, questionText: "Ringo ___ tabemasu (Saya makan apel). (Ketik romaji partikel objek dari kalimat di samping)", correctAnswerText: "o" },
      { id: "q3_5", type: "multiple_choice", weight: 1, questionText: "Partikel yang berfungsi utama untuk menunjukkan tempat terjadinya suatu peristiwa/aksi adalah?", options: [{ text: "で (de)" }, { text: "に (ni)" }, { text: "から (kara)" }, { text: "まで (made)" }], correctOptionIndex: 0 },
      { id: "q3_6", type: "short_answer", weight: 1, questionText: "Gakkou ___ ikimasu (Pergi ke sekolah). Ketik romaji partikel penunjuk arah tujuan pergi pada spasi kosong yang paling tepat.", correctAnswerText: "ni" },
      { id: "q3_7", type: "multiple_choice", weight: 1, questionText: "Apa peran dan fungsi mendasar dari partikel 'の' (no)?", options: [{ text: "Menandakan sebuah pertanyaan" }, { text: "Menyatakan kepemilikan atau modifikasi kata benda" }, { text: "Menunjukkan pergerakan arah jalan" }, { text: "Memberitahukan penunjuk waktu" }], correctOptionIndex: 1 },
      { id: "q3_8", type: "short_answer", weight: 1, questionText: "Kore wa watashi ___ hon desu (Ini adalah buku milik saya). Ketik romaji huruf partikel kepemilikan yang tepat.", correctAnswerText: "no" },
      { id: "q3_9", type: "multiple_choice", weight: 1, questionText: "Partikel yang berada di posisi akhir struktur kalimat bahasa Jepang untuk menjadikannya kalimat tanya?", options: [{ text: "か (ka)" }, { text: "ね (ne)" }, { text: "よ (yo)" }, { text: "わ (wa)" }], correctOptionIndex: 0 },
      { id: "q3_10", type: "short_answer", weight: 1, questionText: "Toko de kaimono o shimasu (Belanja di Toko). Ketik apa arti partikel 'de' pada kalimat tersebut jika diartikan dalam bahasa Indonesia.", correctAnswerText: "Di" }
    ]
  },
  {
    id: "quiz-4",
    title: "Kuis Dasar 4: Kata Sifat (Keiyoushi)",
    description: "Evaluasi kosakata kata sifat golongan -i dan -na dalam kalimat sederhana.",
    createdAt: "2024-03-12",
    questions: [
      { id: "q4_1", type: "multiple_choice", weight: 1, questionText: "Apa arti kata sifat 'tsumaranai'?", options: [{ text: "Bising" }, { text: "Membosankan" }, { text: "Menyenangkan" }, { text: "Murah" }], correctOptionIndex: 1 }
    ]
  },
  {
    id: "quiz-5",
    title: "Kuis Dasar 5: Angka & Penghitungan",
    description: "Uji pemahaman Anda tentang angka 1-100 dan kata bantu bilangan dasar.",
    createdAt: "2024-03-15",
    questions: [
      { id: "q5_1", type: "multiple_choice", weight: 1, questionText: "Bagaimana cara membaca angka 82?", options: [{ text: "Hachijuu ni" }, { text: "Nijuu hachi" }, { text: "Hachijuu" }, { text: "Nana juu ni" }], correctOptionIndex: 0 }
    ]
  },
  {
    id: "quiz-6",
    title: "Kuis Dasar 6: Kata Kerja Aksi (Doushi)",
    description: "Uji penggunaan kata kerja bentuk kamus dan bentuk -masu yang umum.",
    createdAt: "2024-03-18",
    questions: [
      { id: "q6_1", type: "multiple_choice", weight: 1, questionText: "Apa arti kata kerja 'nomimasu'?", options: [{ text: "Makan" }, { text: "Minum" }, { text: "Tidur" }, { text: "Membaca" }], correctOptionIndex: 1 }
    ]
  },
  {
    id: "quiz-7",
    title: "Kuis Dasar 7: Keterangan Waktu",
    description: "Evaluasi pemahaman tentang hari, bulan, dan jam dalam bahasa Jepang.",
    createdAt: "2024-03-20",
    questions: [
      { id: "q7_1", type: "multiple_choice", weight: 1, questionText: "Hari apa 'Suiyoubi' itu?", options: [{ text: "Senin" }, { text: "Rabu" }, { text: "Jumat" }, { text: "Sabtu" }], correctOptionIndex: 1 }
    ]
  },
  {
    id: "quiz-8",
    title: "Kuis Dasar 8: Kata Tanya (Gimonshi)",
    description: "Latihan menanyakan siapa, apa, di mana, kapan, dan bagaimana dalam bahasa Jepang.",
    createdAt: "2024-03-22",
    questions: [
      { id: "q8_1", type: "multiple_choice", weight: 1, questionText: "Mana kata tanya yang berarti 'Kapan'?", options: [{ text: "Itsu" }, { text: "Doko" }, { text: "Dare" }, { text: "Nani" }], correctOptionIndex: 0 }
    ]
  },
  {
    id: "quiz-9",
    title: "Kuis Dasar 9: Keluarga & Kekerabatan",
    description: "Kosakata seputar anggota keluarga sendiri dan keluarga orang lain.",
    createdAt: "2024-03-25",
    questions: [
      { id: "q9_1", type: "multiple_choice", weight: 1, questionText: "Apa panggilan formal untuk Ayah orang lain?", options: [{ text: "Chichi" }, { text: "Okaasan" }, { text: "Otousan" }, { text: "Ani" }], correctOptionIndex: 2 }
    ]
  },
  {
    id: "quiz-10",
    title: "Kuis Dasar 10: Lokasi dan Posisi",
    description: "Mengidentifikasi letak benda (atas, bawah, dalam, luar, kanan, kiri).",
    createdAt: "2024-03-28",
    questions: [
      { id: "q10_1", type: "multiple_choice", weight: 1, questionText: "Apa arti dari 'ue'?", options: [{ text: "Bawah" }, { text: "Atas" }, { text: "Kanan" }, { text: "Kiri" }], correctOptionIndex: 1 }
    ]
  },
  {
    id: "quiz-11",
    title: "Kuis Dasar 11: Arah dan Transportasi",
    description: "Uji kosakata transportasi umum dan arah penunjuk jalan.",
    createdAt: "2024-03-30",
    questions: [
      { id: "q11_1", type: "multiple_choice", weight: 1, questionText: "Bagaimana cara menyebut 'Kereta Api'?", options: [{ text: "Densha" }, { text: "Basu" }, { text: "Chikitetsu" }, { text: "Hikouki" }], correctOptionIndex: 0 }
    ]
  },
  {
    id: "quiz-12",
    title: "Kuis Dasar 12: Hobi & Kegiatan Luar Ruang",
    description: "Uji kosakata tentang musik, olahraga, membaca, dan kegiatan rekreasi lainnya.",
    createdAt: "2024-04-02",
    questions: [
      { id: "q12_1", type: "multiple_choice", weight: 1, questionText: "Apa terjemahan dari 'Shumi'?", options: [{ text: "Pekerjaan" }, { text: "Sekolah" }, { text: "Hobi" }, { text: "Makanan" }], correctOptionIndex: 2 }
    ]
  }
];

export const fallbackHistory: QuizHistoryRecord[] = [
  { id: "h1", quizId: "quiz-1", quizTitle: "Kuis Dasar 1: Kosakata Sehari-hari", score: 90, dateStr: "2024-03-02", timeStr: "09:30:00", studentName: "Budi Santoso" },
  { id: "h2", quizId: "quiz-1", quizTitle: "Kuis Dasar 1: Kosakata Sehari-hari", score: 45, dateStr: "2024-03-02", timeStr: "10:15:00", studentName: "Siti Nurhaliza" },
  { id: "h3", quizId: "quiz-2", quizTitle: "Kuis Dasar 2: Hiragana & Katakana Lanjutan", score: 75, dateStr: "2024-03-06", timeStr: "11:20:00", studentName: "Ahmad Rizki" },
  { id: "h4", quizId: "quiz-1", quizTitle: "Kuis Dasar 1: Kosakata Sehari-hari", score: 55, dateStr: "2024-03-03", timeStr: "14:10:00", studentName: "Dewi Lestari" },
  { id: "h5", quizId: "quiz-3", quizTitle: "Kuis Dasar 3: Partikel dan Tata Bahasa Utama", score: 95, dateStr: "2024-03-11", timeStr: "08:45:00", studentName: "Rudi Hartono" },
  { id: "h6", quizId: "quiz-2", quizTitle: "Kuis Dasar 2: Hiragana & Katakana Lanjutan", score: 50, dateStr: "2024-03-07", timeStr: "16:30:00", studentName: "Budi Santoso" },
  { id: "h7", quizId: "quiz-3", quizTitle: "Kuis Dasar 3: Partikel dan Tata Bahasa Utama", score: 80, dateStr: "2024-03-12", timeStr: "13:00:00", studentName: "Siti Nurhaliza" },
  { id: "h8", quizId: "quiz-1", quizTitle: "Kuis Dasar 1: Kosakata Sehari-hari", score: 70, dateStr: "2024-03-04", timeStr: "10:00:00", studentName: "Ahmad Rizki" },
  { id: "h9", quizId: "quiz-2", quizTitle: "Kuis Dasar 2: Hiragana & Katakana Lanjutan", score: 100, dateStr: "2024-03-08", timeStr: "15:20:00", studentName: "Dewi Lestari" },
  { id: "h10", quizId: "quiz-3", quizTitle: "Kuis Dasar 3: Partikel dan Tata Bahasa Utama", score: 35, dateStr: "2024-03-13", timeStr: "11:10:00", studentName: "Rudi Hartono" },
  { id: "h11", quizId: "quiz-1", quizTitle: "Kuis Dasar 1: Kosakata Sehari-hari", score: 95, dateStr: "2024-03-05", timeStr: "09:00:00", studentName: "Budi Santoso" },
  { id: "h12", quizId: "quiz-2", quizTitle: "Kuis Dasar 2: Hiragana & Katakana Lanjutan", score: 90, dateStr: "2024-03-09", timeStr: "10:30:00", studentName: "Siti Nurhaliza" },
  { id: "h13", quizId: "quiz-3", quizTitle: "Kuis Dasar 3: Partikel dan Tata Bahasa Utama", score: 75, dateStr: "2024-03-14", timeStr: "14:50:00", studentName: "Ahmad Rizki" },
  { id: "h14", quizId: "quiz-1", quizTitle: "Kuis Dasar 1: Kosakata Sehari-hari", score: 85, dateStr: "2024-03-06", timeStr: "16:00:00", studentName: "Dewi Lestari" },
  { id: "h15", quizId: "quiz-2", quizTitle: "Kuis Dasar 2: Hiragana & Katakana Lanjutan", score: 40, dateStr: "2024-03-10", timeStr: "13:40:00", studentName: "Rudi Hartono" }
];

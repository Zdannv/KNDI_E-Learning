export type QuestionType = "multiple_choice" | "short_answer";

export interface QuestionBase {
  id: string;
  type: QuestionType;
  questionText: string;
}

export interface MultipleChoiceQuestion extends QuestionBase {
  type: "multiple_choice";
  options: [string, string, string, string];
  correctOptionIndex: number;
}

export interface ShortAnswerQuestion extends QuestionBase {
  type: "short_answer";
  correctAnswerText: string;
}

export type Question = MultipleChoiceQuestion | ShortAnswerQuestion;

export interface QuizData {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export interface QuizHistoryRecord {
  id: string;
  quizId: string;
  quizTitle: string;
  score: number;
  dateStr: string;
  timeStr: string;
}

export const fallbackMockQuizzes: QuizData[] = [
  {
    id: "quiz-1",
    title: "Kuis Dasar 1: Kosakata Sehari-hari",
    description: "Uji pemahaman Anda tentang kosakata bahasa Jepang dasar sebelum melanjutkan ke bab berikutnya.",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        questionText: "Apa arti dari kata 'Arigatou' (ありがとう) dalam bahasa Indonesia?",
        options: ["Maaf", "Terima Kasih", "Selamat Pagi", "Permisi"],
        correctOptionIndex: 1, // Terima Kasih
      },
      {
        id: "q2",
        type: "short_answer",
        questionText: "Sebutkan terjemahan bahasa Indonesia untuk kata kerja 'Taberu' (食べる).",
        correctAnswerText: "Makan", 
      },
      {
        id: "q3",
        type: "multiple_choice",
        questionText: "Ungkapan manakah yang paling tepat untuk mengucapkan 'Selamat Pagi' dalam bahasa Jepang secara formal?",
        options: ["Konbanwa", "Konnichiwa", "Ohayou Gozaimasu", "Oyasuminasai"],
        correctOptionIndex: 2, // Ohayou Gozaimasu
      }
    ]
  },
  {
    id: "quiz-2",
    title: "Kuis Dasar 2: Hiragana & Katakana Lanjutan",
    description: "Uji kemampuan membaca dan menterjemahkan karakter Hiragana dan Katakana dalam kata-kata sederhana yang sering digunakan sehari-hari.",
    questions: [
      { id: "q2_1", type: "multiple_choice", questionText: "Bagaimana cara membaca karakter hiragana 'くるま' (kuruma)?", options: ["Kereta", "Mobil", "Motor", "Pesawat"], correctOptionIndex: 1 },
      { id: "q2_2", type: "short_answer", questionText: "Tuliskan romaji (huruf latin) dari kata hiragana 'さくら' (huruf kecil semua).", correctAnswerText: "sakura" },
      { id: "q2_3", type: "multiple_choice", questionText: "Karakter Katakana manakah yang dibaca sebagai 'su'?", options: ["ス", "シ", "ツ", "ソ"], correctOptionIndex: 0 },
      { id: "q2_4", type: "short_answer", questionText: "Tuliskan terjemahan bahasa Indonesia untuk kata 'みず' (mizu).", correctAnswerText: "Air" },
      { id: "q2_5", type: "multiple_choice", questionText: "Bagaimana membaca huruf kanji/hiragana 'やま' (yama)?", options: ["Laut", "Sungai", "Gunung", "Hutan"], correctOptionIndex: 2 },
      { id: "q2_6", type: "short_answer", questionText: "Tuliskan romaji dari kata Katakana 'テレビ' (huruf kecil semua).", correctAnswerText: "terebi" },
      { id: "q2_7", type: "multiple_choice", questionText: "Apa arti dari bahasa serapan 'パン' (pan) dalam bahasa Indonesia?", options: ["Panci", "Roti", "Pena", "Nasi"], correctOptionIndex: 1 },
      { id: "q2_8", type: "short_answer", questionText: "Tuliskan romaji dari hiragana 'ねこ' (huruf kecil semua).", correctAnswerText: "neko" },
      { id: "q2_9", type: "multiple_choice", questionText: "Huruf Hiragana manakah yang dibaca sebagai 'chi'?", options: ["さ", "ち", "ら", "き"], correctOptionIndex: 1 },
      { id: "q2_10", type: "short_answer", questionText: "Tuliskan arti dari kata 'いぬ' (inu) dalam bahasa Indonesia.", correctAnswerText: "Anjing" }
    ]
  },
  {
    id: "quiz-3",
    title: "Kuis Dasar 3: Partikel dan Tata Bahasa Utama",
    description: "Evaluasi penguasaan Anda mengenai penggunaan partikel dasar seperti wa, ga, o, ni, dan de dalam penyusunan kalimat bahasa Jepang.",
    questions: [
      { id: "q3_1", type: "multiple_choice", questionText: "Partikel apa yang sering digunakan semata-mata untuk menandai subjek topik dalam sebuah kalimat?", options: ["を (o)", "に (ni)", "は (wa)", "で (de)"], correctOptionIndex: 2 },
      { id: "q3_2", type: "short_answer", questionText: "Watashi ___ gakusei desu. (Ketik satu kata romaji partikel yang melengkapi kalimat topik)", correctAnswerText: "wa" },
      { id: "q3_3", type: "multiple_choice", questionText: "Partikel apa yang digunakan untuk menandai sebuah objek langsung dari kata kerja tindakan?", options: ["が (ga)", "を (o)", "へ (e)", "に (ni)"], correctOptionIndex: 1 },
      { id: "q3_4", type: "short_answer", questionText: "Ringo ___ tabemasu (Saya makan apel). (Ketik romaji partikel objek dari kalimat di samping)", correctAnswerText: "o" },
      { id: "q3_5", type: "multiple_choice", questionText: "Partikel yang berfungsi utama untuk menunjukkan tempat terjadinya suatu peristiwa/aksi adalah?", options: ["で (de)", "に (ni)", "から (kara)", "まで (made)"], correctOptionIndex: 0 },
      { id: "q3_6", type: "short_answer", questionText: "Gakkou ___ ikimasu (Pergi ke sekolah). Ketik romaji partikel penunjuk arah tujuan pergi pada spasi kosong yang paling tepat.", correctAnswerText: "ni" },
      { id: "q3_7", type: "multiple_choice", questionText: "Apa peran dan fungsi mendasar dari partikel 'の' (no)?", options: ["Menandakan sebuah pertanyaan", "Menyatakan kepemilikan atau modifikasi kata benda", "Menunjukkan pergerakan arah jalan", "Memberitahukan penunjuk waktu"], correctOptionIndex: 1 },
      { id: "q3_8", type: "short_answer", questionText: "Kore wa watashi ___ hon desu (Ini adalah buku milik saya). Ketik romaji huruf partikel kepemilikan yang tepat.", correctAnswerText: "no" },
      { id: "q3_9", type: "multiple_choice", questionText: "Partikel yang berada di posisi akhir struktur kalimat bahasa Jepang untuk menjadikannya kalimat tanya?", options: ["か (ka)", "ね (ne)", "よ (yo)", "わ (wa)"], correctOptionIndex: 0 },
      { id: "q3_10", type: "short_answer", questionText: "Toko de kaimono o shimasu (Belanja di Toko). Ketik apa arti partikel 'de' pada kalimat tersebut jika diartikan dalam bahasa Indonesia.", correctAnswerText: "Di" }
    ]
  }
];

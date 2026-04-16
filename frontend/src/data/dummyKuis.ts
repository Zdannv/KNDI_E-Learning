export type QuestionType = "multiple_choice" | "short_answer" | "matching";

export interface QuestionBase {
  id: string;
  type: QuestionType;
  questionText: string;
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

export type Question = MultipleChoiceQuestion | ShortAnswerQuestion | MatchingQuestion;

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
        questionText: "Apa arti rambu ini dalam bahasa Indonesia?",
        imageUrl: "https://placehold.co/600x400/ef4444/white?text=Tomare+(Berhenti)",
        options: [{ text: "Jalan Terus" }, { text: "Berhenti" }, { text: "Belok Kiri" }, { text: "Parkir" }],
        correctOptionIndex: 1, 
      },
      {
        id: "q2",
        type: "short_answer",
        questionText: "Dengarkan audio ini dan tulis apa yang Anda dengar.",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        correctAnswerText: "Musik", 
      },
      {
        id: "q3",
        type: "multiple_choice",
        questionText: "Mana yang merupakan buah apel?",
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
    questions: [
      { id: "q2_1", type: "multiple_choice", questionText: "Bagaimana cara membaca karakter hiragana 'くるま' (kuruma)?", options: [{ text: "Kereta" }, { text: "Mobil" }, { text: "Motor" }, { text: "Pesawat" }], correctOptionIndex: 1 },
      { id: "q2_2", type: "short_answer", questionText: "Tuliskan romaji (huruf latin) dari kata hiragana 'さくら' (huruf kecil semua).", correctAnswerText: "sakura" },
      { id: "q2_3", type: "multiple_choice", questionText: "Karakter Katakana manakah yang dibaca sebagai 'su'?", options: [{ text: "ス" }, { text: "シ" }, { text: "ツ" }, { text: "ソ" }], correctOptionIndex: 0 },
      { id: "q2_4", type: "short_answer", questionText: "Tuliskan terjemahan bahasa Indonesia untuk kata 'みず' (mizu).", correctAnswerText: "Air" },
      { id: "q2_5", type: "multiple_choice", questionText: "Bagaimana membaca huruf kanji/hiragana 'やま' (yama)?", options: [{ text: "Laut" }, { text: "Sungai" }, { text: "Gunung" }, { text: "Hutan" }], correctOptionIndex: 2 },
      { id: "q2_6", type: "short_answer", questionText: "Tuliskan romaji dari kata Katakana 'テレビ' (huruf kecil semua).", correctAnswerText: "terebi" },
      { id: "q2_7", type: "multiple_choice", questionText: "Apa arti dari bahasa serapan 'パン' (pan) dalam bahasa Indonesia?", options: [{ text: "Panci" }, { text: "Roti" }, { text: "Pena" }, { text: "Nasi" }], correctOptionIndex: 1 },
      { id: "q2_8", type: "short_answer", questionText: "Tuliskan romaji dari hiragana 'ねこ' (huruf kecil semua).", correctAnswerText: "neko" },
      { id: "q2_9", type: "multiple_choice", questionText: "Huruf Hiragana manakah yang dibaca sebagai 'chi'?", options: [{ text: "さ" }, { text: "ち" }, { text: "ら" }, { text: "き" }], correctOptionIndex: 1 },
      { id: "q2_10", type: "short_answer", questionText: "Tuliskan arti dari kata 'いぬ' (inu) dalam bahasa Indonesia.", correctAnswerText: "Anjing" }
    ]
  },
  {
    id: "quiz-3",
    title: "Kuis Dasar 3: Partikel dan Tata Bahasa Utama",
    description: "Evaluasi penguasaan Anda mengenai penggunaan partikel dasar seperti wa, ga, o, ni, dan de dalam penyusunan kalimat bahasa Jepang.",
    questions: [
      { id: "q3_1", type: "multiple_choice", questionText: "Partikel apa yang sering digunakan semata-mata untuk menandai subjek topik dalam sebuah kalimat?", options: [{ text: "を (o)" }, { text: "に (ni)" }, { text: "は (wa)" }, { text: "で (de)" }], correctOptionIndex: 2 },
      { id: "q3_2", type: "short_answer", questionText: "Watashi ___ gakusei desu. (Ketik satu kata romaji partikel yang melengkapi kalimat topik)", correctAnswerText: "wa" },
      { id: "q3_3", type: "multiple_choice", questionText: "Partikel apa yang digunakan untuk menandai sebuah objek langsung dari kata kerja tindakan?", options: [{ text: "が (ga)" }, { text: "を (o)" }, { text: "へ (e)" }, { text: "に (ni)" }], correctOptionIndex: 1 },
      { id: "q3_4", type: "short_answer", questionText: "Ringo ___ tabemasu (Saya makan apel). (Ketik romaji partikel objek dari kalimat di samping)", correctAnswerText: "o" },
      { id: "q3_5", type: "multiple_choice", questionText: "Partikel yang berfungsi utama untuk menunjukkan tempat terjadinya suatu peristiwa/aksi adalah?", options: [{ text: "で (de)" }, { text: "に (ni)" }, { text: "から (kara)" }, { text: "まで (made)" }], correctOptionIndex: 0 },
      { id: "q3_6", type: "short_answer", questionText: "Gakkou ___ ikimasu (Pergi ke sekolah). Ketik romaji partikel penunjuk arah tujuan pergi pada spasi kosong yang paling tepat.", correctAnswerText: "ni" },
      { id: "q3_7", type: "multiple_choice", questionText: "Apa peran dan fungsi mendasar dari partikel 'の' (no)?", options: [{ text: "Menandakan sebuah pertanyaan" }, { text: "Menyatakan kepemilikan atau modifikasi kata benda" }, { text: "Menunjukkan pergerakan arah jalan" }, { text: "Memberitahukan penunjuk waktu" }], correctOptionIndex: 1 },
      { id: "q3_8", type: "short_answer", questionText: "Kore wa watashi ___ hon desu (Ini adalah buku milik saya). Ketik romaji huruf partikel kepemilikan yang tepat.", correctAnswerText: "no" },
      { id: "q3_9", type: "multiple_choice", questionText: "Partikel yang berada di posisi akhir struktur kalimat bahasa Jepang untuk menjadikannya kalimat tanya?", options: [{ text: "か (ka)" }, { text: "ね (ne)" }, { text: "よ (yo)" }, { text: "わ (wa)" }], correctOptionIndex: 0 },
      { id: "q3_10", type: "short_answer", questionText: "Toko de kaimono o shimasu (Belanja di Toko). Ketik apa arti partikel 'de' pada kalimat tersebut jika diartikan dalam bahasa Indonesia.", correctAnswerText: "Di" }
    ]
  }
];

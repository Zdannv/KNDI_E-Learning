export interface PendingEssaySubmission {
  id: string;
  userName: string;
  quizTitle: string;
  questionText: string;
  userAnswer: string;
  submittedAt: string;
  questionWeight: 1 | 2 | 3;
}

export const mockPendingSubmissions: PendingEssaySubmission[] = [
  {
    id: "sub-001",
    userName: "Budi Santoso",
    quizTitle: "Kuis Dasar 1: Kosakata Sehari-hari",
    questionText: "Jelaskan perbedaan antara partikel は (wa) dan が (ga) dalam bahasa Jepang dengan memberikan contoh kalimat.",
    userAnswer: "Partikel は (wa) digunakan untuk menandai topik dalam kalimat, sedangkan が (ga) digunakan untuk menandai subjek. Contoh: 私は学生です (Watashi wa gakusei desu) - Saya adalah pelajar. Di sini 'wa' menandai topik. Sedangkan 雨が降っています (Ame ga futteimasu) - Hujan sedang turun. Di sini 'ga' menandai subjek yang melakukan aksi.",
    submittedAt: "2024-01-15T10:30:00",
    questionWeight: 3
  },
  {
    id: "sub-002",
    userName: "Siti Nurhaliza",
    quizTitle: "Kuis Dasar 2: Hiragana & Katakana Lanjutan",
    questionText: "Tulis sebuah paragraf pendek (5-7 kalimat) tentang rutinitas harian Anda dalam bahasa Jepang menggunakan Hiragana.",
    userAnswer: "まいにちろくじにおきます。あさごはんをたべます。それからがっこうにいきます。ごごさんじにうちにかえります。よるはべんきょうします。じゅういちじにねます。",
    submittedAt: "2024-01-15T11:45:00",
    questionWeight: 3
  },
  {
    id: "sub-003",
    userName: "Ahmad Rizki",
    quizTitle: "Kuis Dasar 3: Partikel dan Tata Bahasa Utama",
    questionText: "Analisis penggunaan bentuk sopan (です/ます) dalam percakapan formal. Berikan minimal 3 contoh kalimat dan jelaskan kapan harus menggunakannya.",
    userAnswer: "Bentuk sopan です/ます digunakan dalam situasi formal seperti berbicara dengan atasan, orang yang lebih tua, atau orang yang baru dikenal. Contoh: 1) 私は田中です (Watashi wa Tanaka desu) - Saya Tanaka. 2) 毎日勉強します (Mainichi benkyou shimasu) - Saya belajar setiap hari. 3) これは本です (Kore wa hon desu) - Ini adalah buku. Bentuk ini menunjukkan rasa hormat dan kesopanan dalam komunikasi.",
    submittedAt: "2024-01-15T14:20:00",
    questionWeight: 2
  },
  {
    id: "sub-004",
    userName: "Dewi Lestari",
    quizTitle: "Kuis Dasar 1: Kosakata Sehari-hari",
    questionText: "Jelaskan penggunaan kata sapaan dalam bahasa Jepang berdasarkan waktu dan situasi. Berikan contoh untuk pagi, siang, dan malam.",
    userAnswer: "Dalam bahasa Jepang, sapaan berbeda tergantung waktu. Pagi menggunakan おはようございます (ohayou gozaimasu), siang menggunakan こんにちは (konnichiwa), dan malam menggunakan こんばんは (konbanwa). Untuk situasi informal dengan teman dekat, bisa menggunakan おはよう (ohayou) di pagi hari.",
    submittedAt: "2024-01-16T09:15:00",
    questionWeight: 2
  },
  {
    id: "sub-005",
    userName: "Rudi Hartono",
    quizTitle: "Kuis Dasar 2: Hiragana & Katakana Lanjutan",
    questionText: "Jelaskan perbedaan penggunaan Hiragana dan Katakana dalam penulisan bahasa Jepang. Berikan contoh untuk masing-masing.",
    userAnswer: "Hiragana digunakan untuk kata-kata asli Jepang dan partikel tata bahasa. Contoh: ありがとう (arigatou - terima kasih). Katakana digunakan untuk kata serapan dari bahasa asing, nama asing, dan onomatope. Contoh: コーヒー (koohii - kopi), アメリカ (amerika - Amerika). Katakana juga digunakan untuk penekanan, seperti iklan atau judul.",
    submittedAt: "2024-01-16T13:40:00",
    questionWeight: 3
  }
];

import { FormQuestion, QuizFormState } from "@/types/quiz-type";

export function validateQuizForm(formState: QuizFormState): string | null {
  if (!formState.title.trim()) {
    return "Judul kuis tidak boleh kosong.";
  }

  if (formState.questions.length === 0) {
    return "Kuis harus memiliki minimal 1 soal.";
  }

  for (let i = 0; i < formState.questions.length; i++) {
    const q: FormQuestion = formState.questions[i];
    const num = i + 1;

    if (!q.questionText.trim()) {
      return `Teks pertanyaan soal #${num} tidak boleh kosong.`;
    }

    if (q.type === "multiple_choice") {
      if (q.options.some((o) => !o.text.trim())) {
        return `Semua opsi soal #${num} harus diisi.`;
      }
    } else if (q.type === "short_answer") {
      if (!q.correctAnswerText.trim()) {
        return `Kunci jawaban soal #${num} tidak boleh kosong.`;
      }
    } else if (q.type === "matching") {
      if (q.pairs.length < 1) {
        return `Soal menjodohkan #${num} harus punya minimal 1 pasangan.`;
      }
      for (const pair of q.pairs) {
        if (!pair.leftContent.text.trim() || !pair.rightContent.text.trim()) {
          return `Semua pasangan soal menjodohkan #${num} harus terisi.`;
        }
      }
    }
  }

  return null;
}
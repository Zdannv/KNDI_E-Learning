import { FormQuestion, QuizFormState } from "@/types/quiz-type";

export function validateQuizForm(formState: QuizFormState): string | null {
  if (!formState.title.trim()) {
    return "Judul kuis tidak boleh kosong.";
  }

  if (formState.duration !== "" && formState.duration > 1440) {
    return "Batasan waktu maksimal adalah 24 jam (1440 menit).";
  }

  if (formState.questions.length === 0) {
    return "Kuis harus memiliki minimal 1 soal.";
  }

  for (let i = 0; i < formState.questions.length; i++) {
    const q: FormQuestion = formState.questions[i];
    const num = i + 1;

    const hasQText = q.questionText.trim() !== "";
    const hasQImage = !!q.imageUrl;
    const hasQAudio = !!q.audioUrl;
    if (!hasQText && !hasQImage && !hasQAudio) {
      return `Pertanyaan soal #${num} harus memiliki teks, gambar, atau audio.`;
    }

    if (q.type === "multiple_choice") {
      for (let j = 0; j < q.options.length; j++) {
        const o = q.options[j];
        const hasOptText = o.text.trim() !== "";
        const hasOptImage = !!o.imageUrl;
        const hasOptAudio = !!o.audioUrl;
        if (!hasOptText && !hasOptImage && !hasOptAudio) {
          return `Opsi ${String.fromCharCode(65 + j)} pada soal #${num} harus memiliki teks, gambar, atau audio.`;
        }
      }
    } else if (q.type === "short_answer") {
      if (!q.correctAnswerText.trim()) {
        return `Kunci jawaban soal #${num} tidak boleh kosong.`;
      }
    } else if (q.type === "matching") {
      if (q.pairs.length < 1) {
        return `Soal menjodohkan #${num} harus punya minimal 1 pasangan.`;
      }
      for (let j = 0; j < q.pairs.length; j++) {
        const pair = q.pairs[j];
        const hasLeftText = pair.leftContent.text.trim() !== "";
        const hasLeftImage = !!pair.leftContent.imageUrl;
        const hasLeftAudio = !!pair.leftContent.audioUrl;
        if (!hasLeftText && !hasLeftImage && !hasLeftAudio) {
          return `Bagian kiri pasangan #${j + 1} pada soal menjodohkan #${num} harus memiliki teks, gambar, atau audio.`;
        }

        const hasRightText = pair.rightContent.text.trim() !== "";
        const hasRightImage = !!pair.rightContent.imageUrl;
        const hasRightAudio = !!pair.rightContent.audioUrl;
        if (!hasRightText && !hasRightImage && !hasRightAudio) {
          return `Bagian kanan pasangan #${j + 1} pada soal menjodohkan #${num} harus memiliki teks, gambar, atau audio.`;
        }
      }
    }
  }

  return null;
}
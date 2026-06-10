import { CreateQuestionPayload, Question as BackendQuestion, UpdateQuestionPayload } from "@/app/lib/use-api";
import { FormQuestion, MultipleChoiceOption, MatchingPair, mediaOrUndefined, generateId } from "@/types/quiz-type";

export function toBackendQuestions(questions: FormQuestion[]): CreateQuestionPayload[] {
  return questions.map((q, index): CreateQuestionPayload => {
    const base = {
      question_text: q.questionText,
      image_url: mediaOrUndefined(q.imageUrl),
      audio_url: mediaOrUndefined(q.audioUrl),
      point: q.weight,
      order_number: index + 1,
    };

    switch (q.type) {
      case "multiple_choice":
        return {
          ...base,
          question_type: 1,
          options: q.options.map((o, i) => ({
            option_text: o.text,
            image_url: mediaOrUndefined(o.imageUrl),
            audio_url: mediaOrUndefined(o.audioUrl),
            is_correct: i === q.correctOptionIndex,
          })),
        };

      case "short_answer":
        return {
          ...base,
          question_type: 2,
          correct_answer: q.correctAnswerText,
        };

      case "matching":
        return {
          ...base,
          question_type:  3,
          matching_cards: q.pairs.map((p) => ({
            left_text: p.leftContent.text,
            left_image_url: mediaOrUndefined(p.leftContent.imageUrl),
            left_audio_url: mediaOrUndefined(p.leftContent.audioUrl),
            right_text: p.rightContent.text,
            right_image_url: mediaOrUndefined(p.rightContent.imageUrl),
            right_audio_url: mediaOrUndefined(p.rightContent.audioUrl),
          })),
        };

      case "essay":
        return {
          ...base,
          question_type: 4,
        };
    }
  });
}

export function toUpdatePayload(q: FormQuestion, index: number): UpdateQuestionPayload {
  const base = {
    question_text: q.questionText,
    image_url: mediaOrUndefined(q.imageUrl),
    audio_url: mediaOrUndefined(q.audioUrl),
    point: q.weight,
    order_number: index + 1,
  };

  switch (q.type) {
    case "multiple_choice":
      return {
        ...base,
        options: q.options.map((o, i) => ({
          option_text: o.text,
          image_url: mediaOrUndefined(o.imageUrl),
          audio_url: mediaOrUndefined(o.audioUrl),
          is_correct: i === q.correctOptionIndex,
        })),
      };

    case "short_answer":
      return {
        ...base,
        correct_answer: q.correctAnswerText,
      };

    case "matching":
      return {
        ...base,
        matching_cards: q.pairs.map((p) => ({
          left_text: p.leftContent.text,
          left_image_url: mediaOrUndefined(p.leftContent.imageUrl),
          left_audio_url: mediaOrUndefined(p.leftContent.audioUrl),
          right_text: p.rightContent.text,
          right_image_url: mediaOrUndefined(p.rightContent.imageUrl),
          right_audio_url: mediaOrUndefined(p.rightContent.audioUrl),
        })),
      };

    case "essay":
      return { ...base };
  }
}

export function toFrontendQuestions(backendQuestions: BackendQuestion[]): FormQuestion[] {
  return backendQuestions.map((bq): FormQuestion => {
    const id = String(bq.id);
    const weight = (Math.min(Math.max(bq.point ?? 1, 1), 3)) as 1 | 2 | 3;

    if (bq.question_type === 1) {
      const options = (bq.question_options ?? []).map((o) => ({
        text: o.option_text,
        imageUrl: o.image_url ?? undefined,
        audioUrl: o.audio_url ?? undefined,
      }));
      while (options.length < 4) {
        options.push({ text: "", imageUrl: undefined, audioUrl: undefined });
      }
      const correctIdx = (bq.question_options ?? []).findIndex((o) => o.is_correct);

      return {
        id,
        type: "multiple_choice",
        questionText: bq.question_text,
        weight,
        imageUrl: bq.image_url ?? undefined,
        audioUrl: bq.audio_url ?? undefined,
        options: options as [MultipleChoiceOption, MultipleChoiceOption, MultipleChoiceOption, MultipleChoiceOption],
        correctOptionIndex: correctIdx >= 0 ? correctIdx : 0,
      };
    }

    if (bq.question_type === 2) {
      return {
        id,
        type: "short_answer",
        questionText: bq.question_text,
        weight,
        imageUrl: bq.image_url ?? undefined,
        audioUrl: bq.audio_url ?? undefined,
        correctAnswerText: bq.correct_answer ?? "",
      };
    }

    if (bq.question_type === 4) {
      return {
        id,
        type: "essay",
        questionText: bq.question_text,
        weight,
        imageUrl: bq.image_url ?? undefined,
        audioUrl: bq.audio_url ?? undefined,
      };
    }

    const pairs: MatchingPair[] = (bq.matching_card ?? []).map((c) => ({
      id: String(c.id),
      leftContent:  {
        text: c.left_text,
        imageUrl: c.left_image_url  ?? undefined,
        audioUrl: c.left_audio_url  ?? undefined,
      },
      rightContent: {
        text: c.right_text,
        imageUrl: c.right_image_url ?? undefined,
        audioUrl: c.right_audio_url ?? undefined,
      },
    }));

    return {
      id,
      type: "matching",
      questionText: bq.question_text,
      weight,
      imageUrl: bq.image_url ?? undefined,
      audioUrl: bq.audio_url ?? undefined,
      pairs: pairs.length > 0 ? pairs : [
        { id: generateId(), leftContent: { text: "" }, rightContent: { text: "" } },
        { id: generateId(), leftContent: { text: "" }, rightContent: { text: "" } },
      ],
    };
  });
}
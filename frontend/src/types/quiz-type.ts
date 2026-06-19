// src/types/quiz-type.ts
// Changes: added EssayQuestion + "essay" to unions; added weight to FormQuestionBase

export type QuestionType = "multiple_choice" | "short_answer" | "matching" | "essay"; // <-- added "essay"

export interface MediaFields {
  imageUrl?: string;
  audioUrl?: string;
}

export interface MultipleChoiceOption extends MediaFields {
  text: string;
}

export type QuestionWeight = 1 | 2 | 3;

export interface FormQuestionBase extends MediaFields {
  id: string;
  type: QuestionType;
  questionText: string;
  weight: QuestionWeight;
}

export interface MultipleChoiceQuestion extends FormQuestionBase {
  type: "multiple_choice";
  options: [MultipleChoiceOption, MultipleChoiceOption, MultipleChoiceOption, MultipleChoiceOption];
  correctOptionIndex: number;
}

export interface ShortAnswerQuestion extends FormQuestionBase {
  type: "short_answer";
  correctAnswerText: string;
}

export interface MatchingContent extends MediaFields {
  text: string;
}

export interface MatchingPair {
  id: string;
  leftContent: MatchingContent;
  rightContent: MatchingContent;
}

export interface MatchingQuestion extends FormQuestionBase {
  type: "matching";
  pairs: MatchingPair[];
}

// ── NEW ───────────────────────────────────────────────────────────────────────
export interface EssayQuestion extends FormQuestionBase {
  type: "essay";
  // No correct answer — scored manually by sensei
}
// ─────────────────────────────────────────────────────────────────────────────

export type FormQuestion =
  | MultipleChoiceQuestion
  | ShortAnswerQuestion
  | MatchingQuestion
  | EssayQuestion; // <-- added

export interface QuizFormState {
  title: string;
  description: string;
  isPublished: boolean;
  duration: number;
  questions: FormQuestion[];
}

export const EMPTY_FORM: QuizFormState = {
  title: "",
  description: "",
  isPublished: false,
  duration: 0,
  questions: [],
};

export const generateId = (): string =>
  Math.random().toString(36).substring(2, 9);

export const mediaOrUndefined = (value: string | undefined): string | undefined =>
  value && value.length > 0 ? value : undefined;
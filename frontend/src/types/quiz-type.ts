export type QuestionType = "multiple_choice" | "short_answer" | "matching";

export interface MediaFields {
  imageUrl?: string;
  audioUrl?: string;
}

export interface MultipleChoiceOption extends MediaFields {
  text: string;
}

export interface FormQuestionBase extends MediaFields {
  id: string;
  type: QuestionType;
  questionText: string;
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

export type FormQuestion = MultipleChoiceQuestion | ShortAnswerQuestion | MatchingQuestion;

export interface QuizFormState {
  title: string;
  description: string;
  isPublished: boolean;
  questions: FormQuestion[];
}

export const EMPTY_FORM: QuizFormState = {
  title: "",
  description: "",
  isPublished: false,
  questions: [],
};

export const generateId = (): string =>
  Math.random().toString(36).substring(2, 9);

export const mediaOrUndefined = (value: string | undefined): string | undefined =>
  value && value.length > 0 ? value : undefined;
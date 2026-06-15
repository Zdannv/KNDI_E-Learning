export interface ApiEnvelop<T = unknown> {
  status: "success" | "error";
  data: T | null;
  error: string | null;
}

export class ClientApiError extends Error {
  constructor(
    public readonly httpStatus: number,
    message: string
  ) {
    super(message);
    this.name = "ClientApiError";
  }
}

const TOKEN_KEY      = "app_token";
const USER_KEY       = "app_token_user";
const COOKIE_SESSION = "app_session";
const COOKIE_ROLE    = "app_role";

export const tokenStorage = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

interface FetchOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  authenticated?: boolean;
}

async function apiFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const { method = "GET", body, authenticated = true } = opts;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const headers: Record<string, string> = {};

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (authenticated) {
    const token = tokenStorage.get();
    if (token) {
      headers["Authorization"] = `bearer ${token}`;
    }
  }

  const init: RequestInit = { method, headers };
  if (body !== undefined) {
    init.body = isFormData ? (body as FormData) : JSON.stringify(body);
  }

  const response = await fetch(path, init);
  const envelope: ApiEnvelop<T> = await response.json();

  if (!response.ok) {
    const message = envelope.error ?? `Request failed (${response.status})`;
    throw new ClientApiError(response.status, message);
  }

  return envelope.data as T;
}

export interface AuthUser {
  ID: string;
  username: string;
  email: string;
  role: "sensei" | "student";
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const authApi = {
  async login(username: string, password: string): Promise<AuthResponse> {
    const auth = await apiFetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: { username, password },
      authenticated: false,
    });
    tokenStorage.set(auth.token);
    return auth;
  },

  async register(
    username: string,
    email: string,
    password: string,
    role: "sensei" | "student"
  ): Promise<AuthResponse> {
    const auth = await apiFetch<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: { username, email, password, role },
      authenticated: false,
    });
    tokenStorage.set(auth.token);
    return auth;
  },

  logout(): void {
    tokenStorage.clear();
    document.cookie = `${COOKIE_SESSION}=; path=/; max-age=0; SameSite=Lax`;
    document.cookie = `${COOKIE_ROLE}=; path=/; max-age=0; SameSite=Lax`;
    window.location.href = "/login";
  },
};

export interface Material {
  id: number;
  user_id: string;
  name: string;
  description: string | null;
  file_path: string | null;
  created_at: string;
  updated_at: string;
}

export const materialApi = {
  getAll: (): Promise<Material[]> =>
    apiFetch<Material[]>("/api/materials"),

  getById: (id: number): Promise<Material> =>
    apiFetch<Material>(`/api/materials/${id}`),

  create: (payload: FormData): Promise<Material> =>
    apiFetch<Material>("/api/materials", { method: "POST", body: payload }),

  update: (id: number, payload: FormData): Promise<Material> =>
    apiFetch<Material>(`/api/materials/${id}`, { method: "PUT", body: payload }),

  delete: (id: number): Promise<void> =>
    apiFetch<void>(`/api/materials/${id}`, { method: "DELETE" }),
};

export interface QuestionOption {
  id: number;
  question_id: number;
  option_text: string;
  image_url: string | null;
  audio_url: string | null;
  is_correct: boolean;
}

export interface MatchingCard {
  id: number;
  question_id: number;
  left_text: string;
  left_image_url: string | null;
  left_audio_url: string | null;
  right_text: string;
  right_image_url: string | null;
  right_audio_url: string | null;
}

export interface Question {
  id: number;
  quiz_id: number;
  question_text: string;
  question_type: 1 | 2 | 3 | 4;
  correct_answer: string | null;
  image_url: string | null;
  audio_url: string | null;
  point: number;
  order_number: number;
  question_options?: QuestionOption[];
  matching_card?: MatchingCard[];
}

export interface Quiz {
  id: number;
  sensei_id: string;
  title: string;
  description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  question?: Question[];
}

export interface CreateOptionPayload {
  option_text: string;
  image_url?: string;
  audio_url?: string;
  is_correct: boolean;
}

export interface CreateMatchingCardPayload {
  left_text: string;
  left_image_url?: string;
  left_audio_url?: string;
  right_text: string;
  right_image_url?: string;
  right_audio_url?: string;
}

export interface CreateQuestionPayload {
  question_text: string;
  question_type: 1 | 2 | 3 | 4;
  correct_answer?: string;
  image_url?: string;
  audio_url?: string;
  point: number;
  order_number: number;
  options?: CreateOptionPayload[];
  matching_cards?: CreateMatchingCardPayload[];
}

export interface UpdateQuestionPayload {
  question_text: string;
  correct_answer?: string;
  image_url?: string;
  audio_url?: string;
  point: number;
  order_number: number;
  options?: CreateOptionPayload[];
  matching_cards?: CreateMatchingCardPayload[];
}

export const quizApi = {
  list: (): Promise<Quiz[]> =>
    apiFetch<Quiz[]>("/api/quizzes"),

  getById: (id: number): Promise<Quiz> =>
    apiFetch<Quiz>(`/api/quizzes/${id}`),

  create: (payload: { title: string; description?: string }): Promise<Quiz> =>
    apiFetch<Quiz>("/api/quizzes", { method: "POST", body: payload }),

  update: (
    id: number,
    payload: { title: string; description?: string; is_published: boolean }
  ): Promise<Quiz> =>
    apiFetch<Quiz>(`/api/quizzes/${id}`, { method: "PUT", body: payload }),

  delete: (id: number): Promise<void> =>
    apiFetch<void>(`/api/quizzes/${id}`, { method: "DELETE" }),

  addQuestions: (
    quizId: number,
    questions: CreateQuestionPayload[]
  ): Promise<Question[]> =>
    apiFetch<Question[]>(`/api/quizzes/${quizId}/questions`, {
      method: "POST",
      body: questions,
    }),

  deleteQuestion: (questionId: number): Promise<void> =>
    apiFetch<void>(`/api/questions/${questionId}`, { method: "DELETE" }),

  updateQuestion: (questionId: number, payload: UpdateQuestionPayload): Promise<Question> =>
    apiFetch<Question>(`/api/questions/${questionId}`, {
      method: "PUT",
      body: payload,
    }),
};

export interface AssignmentStart {
  id: number;
  student_id: string;
  quiz_id: number;
  status: number;
  started_at: string;
}

export interface AssignmentHistoryAnswer {
  question_text: string;
  question_type: 1 | 2 | 3 | 4
  your_answer: string;
  is_correct: boolean;
  score_earned: number;
  total_pairs?: number
  pending_grade?: boolean
}

export interface AssignmentResult {
  assignment_id: number;
  quiz_title:    string;
  total_point:   number;
  score_earned:  number;
  score_percent: number;
  passed:        boolean;
  status:        string;
  completed_at:  string | null;
  answers:       AssignmentHistoryAnswer[];
}

export interface HistoryListItem {
  assignment_id: number;
  quiz_id: number
  quiz_title: string;
  student_name?: string
  score_earned: number;
  total_point: number;
  score_percent: number;
  status: string;
  date_str: string;
  time_str: string;
  completed_at: string | null;
}

export interface SubmitAnswer {
  question_id: number;
  question_option_id?: number;
  question_card_id?: number;
  selected_card?: number;
  answer_text?: string;
}

export interface EssayPendingItem {
  assignment_id: number;
  assignment_history_id: number;
  student_name: string;
  quiz_title: string;
  question_id: number;
  question_text: string;
  max_point: number;
  student_answer: string;
}


export const assignmentApi = {
  start: (quizId: number): Promise<AssignmentStart> =>
    apiFetch<AssignmentStart>("/api/assignment", {
      method: "POST",
      body: { quiz_id: quizId },
    }),

  submit: (
    assignmentId: number,
    answers: SubmitAnswer[]
  ): Promise<AssignmentResult> =>
    apiFetch<AssignmentResult>(`/api/assignment/${assignmentId}/submit`, {
      method: "POST",
      body: { answer: answers },
    }),

  getResult: (assignmentId: number): Promise<AssignmentResult> =>
    apiFetch<AssignmentResult>(`/api/assignment/${assignmentId}`),

  getHistory: (): Promise<HistoryListItem[]> =>
    apiFetch<HistoryListItem[]>("/api/assignment/history"),

  getAllHistory: (): Promise<HistoryListItem[]> =>
    apiFetch<HistoryListItem[]>("/api/assignment/all-history"),

  getPendingEssays: (): Promise<EssayPendingItem[]> =>
    apiFetch<EssayPendingItem[]>("/api/assignment/pending-essay"),

  gradeEssay: (assignmentId: number, historyId: number, score: number): Promise<void> =>
    apiFetch<void>(`/api/assignment/${assignmentId}/essay/${historyId}`, {
      method: "PUT",
      body:   { score },
    }),
};

export interface StudentUser {
  id: string;
  username: string;
  email: string;
  role: "student";
  created_at: string;
  updated_at: string;
}

export const studentApi = {
  list: (): Promise<StudentUser[]> =>
    apiFetch<StudentUser[]>("/api/students"),

  create: (payload: { username: string; email: string; password: string }): Promise<StudentUser> =>
    apiFetch<StudentUser>("/api/students", { method: "POST", body: payload }),

  delete: (id: string): Promise<void> =>
    apiFetch<void>(`/api/students/${id}`, { method: "DELETE" }),
};

import {
  UserProfile,
  SchoolProfile,
  AcademicYear,
  Semester,
  Subject,
  Question,
  QuestionSet,
  GameSession,
  GameTeam
} from '../types/index.ts';

const BASE_URL = '';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || `HTTP ${res.status}: Terjadi kesalahan pada server`);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(email: string, password?: string): Promise<{ token: string; user: UserProfile }> {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async getCurrentUser(): Promise<{ user: UserProfile }> {
    const res = await fetch(`${BASE_URL}/api/auth/me`);
    return handleResponse(res);
  },

  // School Settings
  async getSchoolProfile(): Promise<SchoolProfile> {
    const res = await fetch(`${BASE_URL}/api/settings/school`);
    return handleResponse(res);
  },

  async updateSchoolProfile(data: Partial<SchoolProfile>): Promise<SchoolProfile> {
    const res = await fetch(`${BASE_URL}/api/settings/school`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Academic Years
  async getAcademicYears(): Promise<AcademicYear[]> {
    const res = await fetch(`${BASE_URL}/api/academic-years`);
    return handleResponse(res);
  },

  async createAcademicYear(name: string, isActive: boolean): Promise<AcademicYear> {
    const res = await fetch(`${BASE_URL}/api/academic-years`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, isActive }),
    });
    return handleResponse(res);
  },

  async activateAcademicYear(id: string): Promise<{ success: boolean; academicYears: AcademicYear[] }> {
    const res = await fetch(`${BASE_URL}/api/academic-years/${id}/activate`, {
      method: 'PUT',
    });
    return handleResponse(res);
  },

  // Semesters
  async getSemesters(): Promise<Semester[]> {
    const res = await fetch(`${BASE_URL}/api/semesters`);
    return handleResponse(res);
  },

  async activateSemester(id: string): Promise<{ success: boolean; semesters: Semester[] }> {
    const res = await fetch(`${BASE_URL}/api/semesters/${id}/activate`, {
      method: 'PUT',
    });
    return handleResponse(res);
  },

  // Subjects
  async getSubjects(): Promise<Subject[]> {
    const res = await fetch(`${BASE_URL}/api/subjects`);
    return handleResponse(res);
  },

  async updateSubject(id: string, data: Partial<Subject>): Promise<Subject> {
    const res = await fetch(`${BASE_URL}/api/subjects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Questions
  async getQuestions(params?: {
    subjectId?: string;
    difficulty?: string;
    status?: string;
    search?: string;
  }): Promise<Question[]> {
    const query = new URLSearchParams();
    if (params?.subjectId) query.set('subjectId', params.subjectId);
    if (params?.difficulty) query.set('difficulty', params.difficulty);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`${BASE_URL}/api/questions?${query.toString()}`);
    return handleResponse(res);
  },

  async createQuestion(data: Partial<Question>): Promise<Question> {
    const res = await fetch(`${BASE_URL}/api/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateQuestion(id: string, data: Partial<Question>): Promise<Question> {
    const res = await fetch(`${BASE_URL}/api/questions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteQuestion(id: string): Promise<{ message: string; archived: boolean }> {
    const res = await fetch(`${BASE_URL}/api/questions/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Question Sets
  async getQuestionSets(): Promise<QuestionSet[]> {
    const res = await fetch(`${BASE_URL}/api/question-sets`);
    return handleResponse(res);
  },

  async createQuestionSet(data: {
    title: string;
    subjectId: string;
    questionIds: string[];
    description?: string;
  }): Promise<QuestionSet> {
    const res = await fetch(`${BASE_URL}/api/question-sets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // AI Generator
  async generateQuestionsWithAI(payload: {
    subjectName: string;
    subjectId?: string;
    fase: string;
    grade: string;
    academicYearName?: string;
    semesterName?: string;
    chapter?: string;
    material: string;
    submaterial?: string;
    learningObjective?: string;
    difficulty: string;
    type: string;
    count: number;
    extraInstructions?: string;
  }): Promise<{
    count: number;
    provider: string;
    questions: Question[];
    warning?: string;
    note?: string;
  }> {
    const res = await fetch(`${BASE_URL}/api/ai/generate-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Game Engine
  async createGameSession(payload: {
    title: string;
    questionSetId: string;
    turnMode: string;
    teamsData?: GameTeam[];
  }): Promise<GameSession> {
    const res = await fetch(`${BASE_URL}/api/game/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getGameSession(id: string): Promise<GameSession> {
    const res = await fetch(`${BASE_URL}/api/game/${id}`);
    return handleResponse(res);
  },

  async submitGameAnswer(payload: {
    sessionId: string;
    teamId: string;
    questionId: string;
    submittedAnswer: string;
  }): Promise<{
    isCorrect: boolean;
    correctAnswer: string;
    explanation: string;
    pointsEarned: number;
    bonusStarsEarned: number;
    isEliminated: boolean;
    consecutiveErrors: number;
    currentStreak: number;
    starBonusMessage?: string;
    eliminationMessage?: string;
    team: Partial<GameTeam>;
    session: GameSession;
  }> {
    const res = await fetch(`${BASE_URL}/api/game/${payload.sessionId}/submit-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teamId: payload.teamId,
        questionId: payload.questionId,
        submittedAnswer: payload.submittedAnswer,
      }),
    });
    return handleResponse(res);
  },

  async nextTurn(sessionId: string, options?: { nextTeamId?: string; advanceQuestion?: boolean }): Promise<GameSession> {
    const res = await fetch(`${BASE_URL}/api/game/${sessionId}/next-turn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options || {}),
    });
    return handleResponse(res);
  },

  async endGameSession(sessionId: string): Promise<GameSession> {
    const res = await fetch(`${BASE_URL}/api/game/${sessionId}/end`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  // Reports
  async getReportsSummary(): Promise<{
    school: SchoolProfile;
    counts: {
      totalQuestionSets: number;
      totalQuestions: number;
      totalSessions: number;
      completedSessions: number;
      activeSessions: number;
      totalSubjects: number;
    };
    teamRankings: {
      name: string;
      color: string;
      gamesPlayed: number;
      totalPoints: number;
      totalStars: number;
      correctAnswers: number;
      wrongAnswers: number;
      eliminationsCount: number;
    }[];
    recentSessions: GameSession[];
  }> {
    const res = await fetch(`${BASE_URL}/api/reports/summary`);
    return handleResponse(res);
  },
};

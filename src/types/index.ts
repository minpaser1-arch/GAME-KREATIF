export type Role = 'admin' | 'guru';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  nip?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface SchoolProfile {
  name: string;
  appTitle: string;
  headmasterName: string;
  headmasterNip: string;
  developerName: string;
  developerTitle: string;
  educationLevel: string;
  targetGrade: string;
  address: string;
  district: string;
  province: string;
  npsn: string;
  nsm: string;
  logoUrl?: string;
}

export interface AcademicYear {
  id: string;
  name: string; // e.g. "2026/2027"
  isActive: boolean;
  createdAt: string;
}

export type SemesterType = 'ganjil' | 'genap';

export interface Semester {
  id: string;
  academicYearId: string;
  type: SemesterType;
  name: string; // e.g. "Semester Ganjil 2026/2027"
  isActive: boolean;
}

export interface Subject {
  id: string;
  code: string;
  name: string; // IPAS, Matematika, Bahasa Indonesia, Pendidikan Pancasila, SBdP
  fase: string; // Fase C for Kelas VI
  grade: string; // Kelas VI
  description: string;
  color: string;
  iconName: string;
  topics: SubjectTopic[];
}

export interface SubjectTopic {
  id: string;
  subjectId: string;
  chapter: string;
  material: string;
  submaterial?: string;
  learningObjective: string;
}

export type DifficultyLevel = 'mudah' | 'sedang' | 'sulit' | 'hots';
export type QuestionType = 'pilihan_ganda' | 'benar_salah' | 'isian_singkat' | 'uraian';
export type QuestionStatus = 'perlu_ditinjau' | 'disetujui' | 'diarsipkan';

export interface Question {
  id: string;
  subjectId: string;
  subjectName: string;
  fase: string;
  grade: string;
  academicYearId?: string;
  semesterId?: string;
  chapter?: string;
  material: string;
  submaterial?: string;
  learningObjective?: string;
  difficulty: DifficultyLevel;
  type: QuestionType;
  questionText: string;
  options?: string[]; // 4 options A, B, C, D for pilihan_ganda, or 2 for benar_salah
  correctAnswer: string; // "A", "B", "C", "D" or text for isian
  explanation: string;
  source: 'ai_gemini' | 'manual' | 'import';
  status: QuestionStatus;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
  creatorName?: string;
  createdByName?: string;
}

export interface QuestionSet {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  grade: string;
  academicYearId: string;
  academicYearName: string;
  semesterId: string;
  semesterName: string;
  questionIds: string[];
  totalQuestions: number;
  description?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  createdByName?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  nisn?: string;
}

export interface GameTeam {
  id: string;
  name: string; // Garuda, Elang, Rajawali, Cendekia, Kreator, Inovator, Juara, Bintang
  color: string;
  members: TeamMember[];
  points: number;
  stars: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalAnswered: number;
  consecutiveErrors: number;
  currentStreak: number;
  isEliminated: boolean;
  eliminatedAt?: string;
  eliminationReason?: string;
}

export type TurnMode = 'round_robin' | 'teacher_select';
export type GameStatus = 'setup' | 'active' | 'paused' | 'completed' | 'abandoned';

export interface GameEvent {
  id: string;
  gameSessionId: string;
  timestamp: string;
  eventType: 'GAME_STARTED' | 'ANSWER_CORRECT' | 'ANSWER_WRONG' | 'BONUS_STARS' | 'TEAM_ELIMINATED' | 'GAME_PAUSED' | 'GAME_RESUMED' | 'GAME_COMPLETED' | 'TURN_CHANGED';
  teamId?: string;
  teamName?: string;
  questionIndex?: number;
  questionId?: string;
  details: string;
  pointsAwarded?: number;
  starsAwarded?: number;
}

export interface GameAnswer {
  id: string;
  gameSessionId: string;
  questionId: string;
  questionIndex: number;
  teamId: string;
  teamName: string;
  submittedAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
  bonusStarsEarned: number;
  consecutiveErrorsAtAnswer: number;
  streakAtAnswer: number;
  timestamp: string;
}

export interface GameSession {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  grade: string;
  academicYearId: string;
  academicYearName: string;
  semesterId: string;
  semesterName: string;
  questionSetId: string;
  questionSetTitle: string;
  questions: Question[];
  currentQuestionIndex: number;
  turnMode: TurnMode;
  currentTeamId: string;
  teams: GameTeam[];
  status: GameStatus;
  startedAt: string;
  endedAt?: string;
  events: GameEvent[];
  answers: GameAnswer[];
  teacherId: string;
  teacherName: string;
}

export interface GameSummaryReport {
  sessionId: string;
  title: string;
  subjectName: string;
  academicYearName: string;
  semesterName: string;
  totalQuestions: number;
  questionsAnswered: number;
  durationMinutes: number;
  startedAt: string;
  endedAt?: string;
  leaderboard: {
    rank: number;
    teamName: string;
    points: number;
    stars: number;
    correct: number;
    wrong: number;
    accuracyPercent: number;
    isEliminated: boolean;
  }[];
}

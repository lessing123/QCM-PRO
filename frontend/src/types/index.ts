export type Role = 'ADMIN' | 'STUDENT'
export type QuestionType = 'SINGLE' | 'MULTIPLE' | 'TRUE_FALSE'
export type AttemptStatus = 'EN_COURS' | 'TERMINE'

export interface User {
  id: string
  email: string
  nom: string
  prenom: string
  role: Role
  is_online?: boolean
  last_seen?: string
  must_change_password?: boolean
  password_temp?: string | null
  createdAt: string
}

export interface Group {
  id: string
  nom: string
  description?: string
  createdAt: string
  users?: User[]
  _count?: { users: number; exams: number }
}

export interface ClassAverage {
  id: string
  nom: string
  description?: string
  students: number
  exams: number
  attempts: number
  averageScore: number
}

export interface Exam {
  id: string
  titre: string
  description?: string
  duree_minutes: number
  date_debut?: string
  date_fin?: string
  tentatives_max: number
  melange_questions: boolean
  melange_reponses: boolean
  resultats_publics?: boolean
  createdAt: string
  createdById: string
  createdBy?: { id: string; nom: string; prenom: string }
  questions?: Question[]
  groups?: Group[]
  _count?: { questions: number; attempts: number }
  attemptsCount?: number
  canTake?: boolean
  currentAttemptId?: string | null
}

export interface Question {
  id: string
  examId: string
  enonce: string
  type: QuestionType
  points: number
  ordre: number
  createdAt: string
  answers?: Answer[]
}

export interface Answer {
  id: string
  questionId: string
  texte: string
  image_url?: string | null
  est_correcte: boolean
  ordre: number
}

export interface Attempt {
  id: string
  userId: string
  examId: string
  score?: number | null
  date_debut: string
  date_fin?: string
  statut: AttemptStatus
  createdAt: string
  user?: User
  exam?: Exam
  studentAnswers?: StudentAnswer[]
}

export interface StudentAnswer {
  id: string
  attemptId: string
  questionId: string
  answerId?: string
  est_correcte?: boolean
  createdAt: string
  question?: Question
  answer?: Answer
}

export interface Notification {
  id: string
  type: 'TAB_CHANGE' | 'EXAM_QUIT' | string
  message: string
  userId: string
  examId?: string
  lu: boolean
  createdAt: string
  user?: { id: string; nom: string; prenom: string }
}

export interface ExamResults {
  attempts: Attempt[]
  stats: { total: number; moyenne: number; min: number; max: number }
  exam: { id: string; titre: string; resultats_publics: boolean }
}

export interface QuestionStats {
  questionId: string
  enonce: string
  type: QuestionType
  points: number
  totalResponses: number
  correctCount: number
  successRate: number
  answers: { answerId: string; texte: string; est_correcte: boolean; count: number; percentage: number }[]
}

export interface GlobalStats {
  totalAttempts: number
  averageScore: number
  minScore: number
  maxScore: number
}

export interface AdminStats {
  examCount: number
  studentCount: number
  attemptCount: number
  avgScore: number
  recentExams: { id: string; titre: string; createdAt: string; _count: { attempts: number } }[]
  recentAttempts: Attempt[]
  classAverages: ClassAverage[]
}

export interface ExamFormData {
  titre: string
  description?: string
  duree_minutes: number
  date_debut?: string
  date_fin?: string
  tentatives_max: number
  melange_questions: boolean
  melange_reponses: boolean
  groupIds?: string[]
}

export interface QuestionFormData {
  enonce: string
  type: QuestionType
  points: number
  ordre: number
  answers: { id?: string; texte: string; image_url?: string | null; est_correcte: boolean; ordre: number }[]
}

export interface StudentFormData {
  email: string
  password?: string
  nom: string
  prenom: string
}

export interface GroupFormData {
  nom: string
  description?: string
  userIds?: string[]
}

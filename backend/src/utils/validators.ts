import { z } from 'zod'

// ========== AUTH ==========

export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  nom: z.string().min(1, 'Le nom est requis'),
  prenom: z.string().min(1, 'Le prénom est requis'),
  role: z.enum(['ADMIN', 'STUDENT']).optional().default('STUDENT'),
})

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
})

// ========== EXAMENS ==========

export const examSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis').max(200),
  description: z.string().optional(),
  duree_minutes: z.number().int().min(1).max(180).default(60),
  date_debut: z.string().datetime().optional().nullable(),
  date_fin: z.string().datetime().optional().nullable(),
  tentatives_max: z.number().int().min(1).max(10).default(1),
  melange_questions: z.boolean().default(false),
  melange_reponses: z.boolean().default(false),
  groupIds: z.array(z.string()).optional(),
  code_acces: z.string().max(8).optional().nullable(),
})

// ========== QUESTIONS ==========

export const questionSchema = z.object({
  examId: z.string().uuid('ID d\'examen invalide'),
  enonce: z.string().min(1, 'L\'énoncé est requis'),
  type: z.enum(['SINGLE', 'MULTIPLE', 'TRUE_FALSE']).default('SINGLE'),
  points: z.number().int().min(1).max(10).default(1),
  ordre: z.number().int().min(0).default(0),
  answers: z.array(
    z.object({
      texte: z.string().min(1, 'Le texte de la réponse est requis'),
      est_correcte: z.boolean().default(false),
      ordre: z.number().int().min(0).default(0),
    })
  ).min(2, 'Au moins 2 réponses sont requises'),
})

export const updateQuestionSchema = z.object({
  enonce: z.string().min(1, 'L\'énoncé est requis').optional(),
  type: z.enum(['SINGLE', 'MULTIPLE', 'TRUE_FALSE']).optional(),
  points: z.number().int().min(1).max(10).optional(),
  ordre: z.number().int().min(0).optional(),
  answers: z.array(
    z.object({
      id: z.string().uuid().optional(),
      texte: z.string().min(1, 'Le texte de la réponse est requis'),
      est_correcte: z.boolean(),
      ordre: z.number().int().min(0),
    })
  ).min(2).optional(),
})

// ========== GROUPES ==========

export const groupSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis').max(100),
  description: z.string().optional(),
  userIds: z.array(z.string()).optional(),
})

// ========== IMPORT ÉTUDIANTS ==========

export const importStudentsSchema = z.object({
  students: z.array(
    z.object({
      email: z.string().email('Email invalide'),
      nom: z.string().min(1, 'Le nom est requis'),
      prenom: z.string().min(1, 'Le prénom est requis'),
    })
  ).min(1, 'Au moins un étudiant est requis'),
  groupId: z.string().uuid().optional(),
})

// ========== PARAMÈTRES D'URL ==========

export const idParamSchema = z.object({
  id: z.string().uuid('ID invalide'),
})

export const examIdParamSchema = z.object({
  examId: z.string().uuid('ID d\'examen invalide'),
})

// ========== TENTATIVES ==========

export const submitAnswerSchema = z.object({
  questionId: z.string().uuid('ID de question invalide'),
  answerId: z.string().uuid('ID de réponse invalide').optional(),
  answerIds: z.array(z.string().uuid()).optional(),
})

// ========== TYPES TYPESCRIPT ==========

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ExamInput = z.infer<typeof examSchema>
export type QuestionInput = z.infer<typeof questionSchema>
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>
export type ImportStudentsInput = z.infer<typeof importStudentsSchema>
export type GroupInput = z.infer<typeof groupSchema>
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>

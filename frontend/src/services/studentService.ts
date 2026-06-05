import api from './api'
import { Exam, Attempt, StudentFormData, Group, GroupFormData } from '../types'

export const studentService = {
  // ========== EXAMENS ==========

  // Liste des examens disponibles
  async getAvailableExams(): Promise<{ exams: Exam[] }> {
    const response = await api.get('/student/exams')
    return response.data
  },

  // Obtenir les détails d'un examen
  async getExamDetails(id: string): Promise<{ exam: Exam }> {
    const response = await api.get(`/student/exams/${id}`)
    return response.data
  },

  // Démarrer un examen
  async startExam(id: string, code_acces?: string): Promise<{ message: string; attempt: Attempt; exam: Exam }> {
    const response = await api.post(`/student/exams/${id}/start`, code_acces ? { code_acces } : {})
    return response.data
  },

  // ========== TENTATIVES ==========

  // Historique des tentatives
  async getMyAttempts(): Promise<{ attempts: Attempt[] }> {
    const response = await api.get('/student/attempts')
    return response.data
  },

  // Obtenir une tentative
  async getAttempt(id: string): Promise<{ attempt: Attempt }> {
    const response = await api.get(`/student/attempts/${id}`)
    return response.data
  },

  // Soumettre une réponse
  async submitAnswer(attemptId: string, questionId: string, answerId?: string, answerIds?: string[]): Promise<{ message: string }> {
    const response = await api.post(`/student/attempts/${attemptId}/answer`, {
      questionId,
      answerId,
      answerIds,
    })
    return response.data
  },

  // Terminer l'examen
  async submitExam(attemptId: string): Promise<{ message: string; attempt: Attempt; score: number; details: { totalPoints: number; earnedPoints: number } }> {
    const response = await api.post(`/student/attempts/${attemptId}/submit`)
    return response.data
  },

  // Obtenir le résultat
  async getResult(attemptId: string): Promise<{ attempt: Attempt; summary: { score: number; totalQuestions: number; correctAnswers: number } }> {
    const response = await api.get(`/student/results/${attemptId}`)
    return response.data
  },

  // ========== ADMIN - ÉTUDIANTS ==========

  // Liste des étudiants
  async getAllStudents(): Promise<{ students: any[] }> {
    const response = await api.get('/admin/students')
    return response.data
  },

  // Obtenir un étudiant
  async getStudent(id: string): Promise<{ student: any }> {
    const response = await api.get(`/admin/students/${id}`)
    return response.data
  },

  // Créer un étudiant
  async createStudent(data: StudentFormData): Promise<{ message: string; student: any }> {
    const response = await api.post('/admin/students', data)
    return response.data
  },

  // Mettre à jour un étudiant
  async updateStudent(id: string, data: Partial<StudentFormData>): Promise<{ message: string; student: any }> {
    const response = await api.put(`/admin/students/${id}`, data)
    return response.data
  },

  // Supprimer un étudiant
  async deleteStudent(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/admin/students/${id}`)
    return response.data
  },

  // Importer des étudiants
  async importStudents(students: Omit<StudentFormData, 'password'>[], groupId?: string): Promise<{ message: string; students: any[]; errors?: any[] }> {
    const response = await api.post('/admin/students/import', { students, ...(groupId ? { groupId } : {}) })
    return response.data
  },

  // ========== CLASSES ==========

  // Liste des classes
  async getAllGroups(): Promise<{ groups: Group[] }> {
    const response = await api.get('/admin/classes')
    return response.data
  },

  // Obtenir une classe
  async getGroup(id: string): Promise<{ group: Group }> {
    const response = await api.get(`/admin/classes/${id}`)
    return response.data
  },

  // Créer une classe
  async createGroup(data: GroupFormData): Promise<{ message: string; group: Group }> {
    const response = await api.post('/admin/classes', data)
    return response.data
  },

  // Mettre à jour une classe
  async updateGroup(id: string, data: GroupFormData): Promise<{ message: string; group: Group }> {
    const response = await api.put(`/admin/classes/${id}`, data)
    return response.data
  },

  // Supprimer une classe
  async deleteGroup(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/admin/classes/${id}`)
    return response.data
  },

  // Réinitialiser le mot de passe d'un étudiant (admin)
  async resetPassword(id: string, password?: string): Promise<{ message: string; password: string }> {
    const response = await api.post(`/admin/students/${id}/reset-password`, { password })
    return response.data
  },

  async toggleActive(id: string): Promise<{ message: string; is_active: boolean }> {
    const response = await api.patch(`/admin/students/${id}/toggle-active`)
    return response.data
  },
}

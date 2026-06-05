import api from './api'
import { Exam, ExamFormData, Question, QuestionFormData, ExamResults, QuestionStats, GlobalStats, AdminStats } from '../types'

export const examService = {
  async getAll(): Promise<{ exams: Exam[] }> {
    return (await api.get('/admin/exams')).data
  },
  async getById(id: string): Promise<{ exam: Exam }> {
    return (await api.get(`/admin/exams/${id}`)).data
  },
  async create(data: ExamFormData): Promise<{ message: string; exam: Exam }> {
    return (await api.post('/admin/exams', data)).data
  },
  async update(id: string, data: ExamFormData): Promise<{ message: string; exam: Exam }> {
    return (await api.put(`/admin/exams/${id}`, data)).data
  },
  async delete(id: string): Promise<{ message: string }> {
    return (await api.delete(`/admin/exams/${id}`)).data
  },
  async duplicate(id: string): Promise<{ message: string; exam: Exam }> {
    return (await api.post(`/admin/exams/${id}/duplicate`)).data
  },

  // Publier / masquer les notes
  async toggleResults(id: string): Promise<{ message: string; exam: { id: string; titre: string; resultats_publics: boolean } }> {
    return (await api.patch(`/admin/exams/${id}/toggle-results`)).data
  },

  async getQuestions(examId: string): Promise<{ questions: Question[] }> {
    return (await api.get(`/admin/exams/${examId}/questions`)).data
  },
  async createQuestion(data: QuestionFormData & { examId: string }): Promise<{ message: string; question: Question }> {
    return (await api.post('/admin/questions', data)).data
  },
  async updateQuestion(id: string, data: Partial<QuestionFormData>): Promise<{ message: string; question: Question }> {
    return (await api.put(`/admin/questions/${id}`, data)).data
  },
  async deleteQuestion(id: string): Promise<{ message: string }> {
    return (await api.delete(`/admin/questions/${id}`)).data
  },

  async getResults(examId: string): Promise<ExamResults> {
    return (await api.get(`/admin/results/${examId}`)).data
  },
  async getStats(examId: string): Promise<{ exam: Exam; globalStats: GlobalStats; questionStats: QuestionStats[] }> {
    return (await api.get(`/admin/stats/${examId}`)).data
  },
  async exportResults(examId: string): Promise<Blob> {
    return (await api.get(`/admin/export/${examId}`, { responseType: 'blob' })).data
  },
  async exportResultsPdf(examId: string): Promise<Blob> {
    return (await api.get(`/admin/export/${examId}/pdf`, { responseType: 'blob' })).data
  },
  async getAdminStats(): Promise<AdminStats> {
    return (await api.get('/admin/stats')).data
  },
  async getExamLive(examId: string): Promise<any> {
    return (await api.get(`/admin/live/${examId}`)).data
  },

  // Upload d'image pour une réponse
  async uploadImage(file: File): Promise<{ url: string }> {
    const form = new FormData()
    form.append('image', file)
    return (await api.post('/upload/image', form, { headers: { 'Content-Type': 'multipart/form-data' } })).data
  },
}

import api from './api';

export const practiceService = {
  getProblems: () => api.get('/practice'),
  saveProblem: (problemData) => api.post('/practice', problemData),
  getProblemById: (id) => api.get(`/practice/${id}`),
  submitAttempt: (id, attemptData) => api.post(`/practice/${id}/attempts`, attemptData),
  getAttempts: () => api.get('/practice/attempts'),
};

export const chatService = {
  getConversations: () => api.get('/conversations'),
  createConversation: (title, language) => api.post('/conversations', { title, language }),
  getConversationById: (id) => api.get(`/conversations/${id}`),
  updateConversation: (id, title) => api.patch(`/conversations/${id}`, { title }),
  deleteConversation: (id) => api.delete(`/conversations/${id}`),
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getActivity: () => api.get('/dashboard/activity'),
};

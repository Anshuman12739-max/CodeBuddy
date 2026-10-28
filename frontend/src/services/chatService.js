import api from './api';

export const chatService = {
  getConversations: () => api.get('/conversations'),
  createConversation: (title, language) => api.post('/conversations', { title, language }),
  getConversationById: (id) => api.get(`/conversations/${id}`),
  updateConversation: (id, title) => api.patch(`/conversations/${id}`, { title }),
  deleteConversation: (id) => api.delete(`/conversations/${id}`),
};

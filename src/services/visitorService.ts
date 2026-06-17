import api from './api';

export const visitorService = {
  getAllVisitors: () => api.get('/visitors'),
  addVisitor: (data: any) => api.post('/visitors', data),
  updateVisitor: (id: string, data: any) => api.patch(`/visitors/${id}`, data),
  deleteVisitor: (id: string) => api.delete(`/visitors/${id}`)
};
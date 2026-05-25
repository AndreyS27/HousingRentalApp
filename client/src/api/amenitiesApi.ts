import api from './client';

export const amenitiesApi = {
  getAll: () => api.get('/amenities'),
};
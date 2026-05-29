import api from './client';

export const propertyTypesApi = {
  getAll: () => api.get('/PropertyTypes'),
};
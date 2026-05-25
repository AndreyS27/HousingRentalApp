import api from './client';
import { PropertyDetails, PropertySummary, SearchParams, SearchResponse } from '../types';

export const propertiesApi = {
  search: (params: SearchParams) =>
    api.get<SearchResponse>('/properties/search', { params }),

  getById: (id: number) =>
    api.get<PropertyDetails>(`/properties/${id}`),
  getMyProperties: () => api.get<PropertySummary[]>('/properties/my'),
  update: (id: number, data: { title: string; pricePerNight: number; address: string }) =>
    api.put(`/properties/${id}`, data),
  delete: (id: number) => api.delete(`/properties/${id}`),
  create: (formData: FormData) => 
  api.post<PropertyDetails>('/properties', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};
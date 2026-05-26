import api from './client';
import { PropertyDetails, PropertySummary, SearchParams, SearchResponse } from '../types';

export const propertiesApi = {
  search: (params: SearchParams) =>
    api.get<SearchResponse>('/properties/search', { params }),

  getById: (id: number) =>
    api.get<PropertyDetails>(`/properties/${id}`),
  getMyProperties: () => api.get<PropertySummary[]>('/properties/my'),
  update: (id: number, data: any) => api.put(`/properties/${id}`, data),
  addPhotos: (id: number, formData: FormData) =>
    api.post(`/properties/${id}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  setMainPhoto: (propertyId: number, photoId: number) =>
    api.put(`/properties/${propertyId}/photos/${photoId}/main`),
  delete: (id: number) => api.delete(`/properties/${id}`),
  create: (formData: FormData) =>
    api.post<PropertyDetails>('/properties', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};
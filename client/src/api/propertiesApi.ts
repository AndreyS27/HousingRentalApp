import api from './client';
import { PropertyDetails, PropertySummary, SearchParams, SearchResponse } from '../types';

export const propertiesApi = {
  // Поиск объектов с фильтрацией
  search: (params: SearchParams) => 
    api.get<SearchResponse>('/properties/search', { params }),
  
  // Получить детали объекта по ID
  getById: (id: number) => 
    api.get<PropertyDetails>(`/properties/${id}`),
  
  // Получить мои объекты (для арендодателя)
  getMyProperties: () => 
    api.get<PropertySummary[]>('/properties/my'),
  
  // Создать объект
  create: (data: FormData) => 
    api.post<PropertyDetails>('/properties', data),
  
  // Обновить объект
  update: (id: number, data: FormData) => 
    api.put<PropertyDetails>(`/properties/${id}`, data),
  
  // Удалить объект
  delete: (id: number) => 
    api.delete(`/properties/${id}`),
};
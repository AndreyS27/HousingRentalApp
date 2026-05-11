import api from './client';
import { PropertySummary, SearchParams, SearchResponse } from '../types';

export const propertiesApi = {
  search: (params: SearchParams) => 
    api.get<SearchResponse>('/properties/search', { params }),
  
  getById: (id: number) => 
    api.get(`/properties/${id}`),
};
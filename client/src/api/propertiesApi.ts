import api from './client';
import { PropertyDetails, PropertySummary, SearchParams, SearchResponse } from '../types';

export const propertiesApi = {
  search: (params: SearchParams) => 
    api.get<SearchResponse>('/properties/search', { params }),

  getById: (id: number) => 
    api.get<PropertyDetails>(`/properties/${id}`),
};
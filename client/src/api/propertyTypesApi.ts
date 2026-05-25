import api from './client';
import { PropertyType } from '../types';

export const propertyTypesApi = {
  getAll: () => api.get<PropertyType[]>('/propertytypes'),
};
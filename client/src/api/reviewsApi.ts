import api from './client';
import { Review } from '../types';

export const reviewsApi = {
  getMyReviews: () => api.get('/reviews/my'),
  getReviewsByPropertyId: (propertyId: number) => 
    api.get<Review[]>(`/reviews/property/${propertyId}`),
  createReview: (data: { bookingId: number; rating: number; comment: string }) =>
    api.post('/reviews', data),
  updateReview: (id: number, data: { rating: number; comment: string }) =>
    api.put(`/reviews/${id}`, data),
  deleteReview: (id: number) => api.delete(`/reviews/${id}`),
};
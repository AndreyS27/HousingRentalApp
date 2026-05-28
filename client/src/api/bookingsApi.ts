import api from './client';

export const bookingsApi = {
  // Арендатор
  getMyActiveBookings: () => api.get('/bookings/my/active'),
  getMyHistoryBookings: () => api.get('/bookings/my/history'),
  
  // Арендодатель
  getBookingRequestsForOwner: () => api.get('/bookings/owner/requests'),
  getActiveBookingsForOwner: () => api.get('/bookings/owner/active'),
  getPastBookingsForOwner: () => api.get('/bookings/owner/past'),
  getReviewsForOwner: () => api.get('/bookings/owner/reviews'),
  
  // Действия
  create: (data: { propertyId: number; checkInDate: string; checkOutDate: string; guestsCount: number }) =>
    api.post('/bookings', data),
  pay: (bookingId: number, data: { paymentMethod: string }) =>
    api.post(`/bookings/${bookingId}/pay`, data),
  cancelBooking: (id: number) => api.delete(`/bookings/${id}`),
  confirmBooking: (id: number) => api.post(`/bookings/${id}/confirm`),
  rejectBooking: (id: number) => api.post(`/bookings/${id}/reject`),
};
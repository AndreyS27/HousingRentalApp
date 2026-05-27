import api from './client';

export const bookingsApi = {
  create: (data: { propertyId: number; checkInDate: string; checkOutDate: string; guestsCount: number }) =>
    api.post('/bookings', data),
  
  pay: (bookingId: number, data: { paymentMethod: string }) =>
    api.post(`/bookings/${bookingId}/pay`, data),
  
  getMyBookings: () => api.get('/bookings/my'),
  getMyPastBookings: () => api.get('/bookings/my/past'),
  getBookingRequestsForOwner: () => api.get('/bookings/owner/'),
  getPastBookingsForOwner: () => api.get('/bookings/owner/past'),
  getReviewsForOwner: () => api.get('/bookings/owner/reviews'),
  cancelBooking: (id: number) => api.delete(`/bookings/${id}`),
  confirmBooking: (id: number) => api.post(`/bookings/${id}/confirm`),
  rejectBooking: (id: number) => api.post(`/bookings/${id}/reject`),
};
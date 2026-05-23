import api from './client';

export const bookingsApi = {
  getMyBookings: () => api.get('/bookings/my'),
  getMyPastBookings: () => api.get('/bookings/my/past'),
  getBookingRequestsForOwner: () => api.get('/bookings/owner/requests'),
  getPastBookingsForOwner: () => api.get('/bookings/owner/past'),
  getReviewsForOwner: () => api.get('/bookings/owner/reviews'),
  cancelBooking: (id: number) => api.delete(`/bookings/${id}`),
  confirmBooking: (id: number) => api.post(`/bookings/${id}/confirm`),
  rejectBooking: (id: number) => api.post(`/bookings/${id}/reject`),
};
using HousingRentalApp.Api.DTOs;
using HousingRentalApp.Api.Models;

namespace HousingRentalApp.Api.Services
{
    public interface IBookingService
    {
        // Методы для арендатора
        Task<Booking?> CreateBookingAsync(int renterId, CreateBookingRequest request);
        Task<bool> CancelBookingAsync(int bookingId, int userId);
        Task<List<BookingResponse>> GetMyBookingsAsync(int userId);

        // Для арендодателя
        Task<List<BookingResponse>> GetBookingsForMyPropertiesAsync(int ownerId);
        Task<bool> ConfirmBookingAsync(int bookingId, int ownerId);
        Task<bool> RejectBookingAsync(int bookingId, int ownerId);

        // Общие
        Task<BookingResponse?> GetBookingDetailsAsync(int bookingId, int userId);
        Task<bool> CanLeaveReviewAsync(int bookingId, int userId);

        // "фоновый" процесс для поиска завершённых бронирований
        Task<int> CompleteExpiredBookingsAsync();

        Task<List<BookingResponse>> GetMyPastBookingsAsync(int userId);
        Task<List<BookingResponse>> GetBookingRequestsForOwnerAsync(int ownerId);
        Task<List<BookingResponse>> GetPastBookingsForOwnerAsync(int ownerId);
        Task<List<ReviewResponse>> GetReviewsForOwnerAsync(int ownerId);

        Task<List<BookingResponse>> GetActiveBookingsForOwnerAsync(int ownerId);
    }
}

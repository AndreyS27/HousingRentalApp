using HousingRentalApp.Api.Models;

namespace HousingRentalApp.Api.Data.Repositories
{
    public interface IBookingRepository
    {
        // Основные CRUD
        Task<Booking?> GetByIdAsync(int bookingId);
        Task<Booking> CreateAsync(Booking booking);
        Task<Booking> UpdateAsync(Booking booking);

        // Проверки доступности
        Task<bool> IsAvailableAsync(int propertyId, DateOnly checkIn, DateOnly checkOut);
        Task<decimal> CalculateTotalPriceAsync(int propertyId, DateOnly checkIn, DateOnly checkOut);

        // Получение списков
        Task<List<Booking>> GetByRenterIdAsync(int renterId);
        Task<List<Booking>> GetByOwnerIdAsync(int ownerId);

        // Управление статусами
        Task<bool> UpdateStatusAsync(int bookingId, int statusId);

        // Проверка владельца
        Task<bool> IsRenterAsync(int bookingId, int userId);
        Task<bool> IsOwnerOfBookingAsync(int bookingId, int userId);

        // Для отзывов
        Task<bool> CanLeaveReviewAsync(int bookingId, int userId);

        // Автоматическое завершение
        Task<int> CompleteExpiredBookingsAsync();
    }
}

using HousingRentalApp.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace HousingRentalApp.Api.Data.Repositories
{
    public class BookingRepository : IBookingRepository
    {
        private readonly ApplicationDbContext _context;

        // Статусы бронирований
        // 1 - ожидает подтверждения
        // 2 - подтверждено
        // 3 - отменено арендатором
        // 4 - отклонено арендодателем
        // 5 - завершено
        public BookingRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Booking?> GetByIdAsync(int bookingId)
        {
            return await _context.Bookings
                .Include(b => b.Property)
                    .ThenInclude(p => p!.PropertyPhotos)
                .Include(b => b.Property)
                    .ThenInclude(p => p!.Owner)
                .Include(b => b.Renter)
                .Include(b => b.Status)
                .FirstOrDefaultAsync(b => b.BookingId == bookingId);
        }

        public async Task<Booking> CreateAsync(Booking booking)
        {
            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();
            return booking;
        }

        public async Task<Booking> UpdateAsync(Booking booking)
        {
            _context.Bookings.Update(booking);
            await _context.SaveChangesAsync();
            return booking;
        }

        /// <summary>
        /// Проверяет, свободны ли выбранные даты для объекта
        /// </summary>
        public async Task<bool> IsAvailableAsync(int propertyId, DateOnly checkIn, DateOnly checkOut)
        {
            // 1. Проверяем подтверждённые бронирования
            var hasConflictingBooking = await _context.Bookings.AnyAsync(b =>
                b.PropertyId == propertyId &&
                b.StatusId == 2 && // Только подтверждённые
                b.CheckInDate < checkOut &&
                b.CheckOutDate > checkIn);

            if (hasConflictingBooking)
                return false;

            // 2. Проверяем ручную блокировку дат
            // Генерируем список дат в диапазоне
            var dates = new List<DateOnly>();
            for (var date = checkIn; date < checkOut; date = date.AddDays(1))
            {
                dates.Add(date);
            }

            var hasManualBlock = await _context.PropertyAvailabilities.AnyAsync(pa =>
                pa.PropertyId == propertyId &&
                pa.IsAvailable == false &&
                dates.Contains(pa.Date));

            return !hasManualBlock;
        }

        /// <summary>
        /// Рассчитывает общую стоимость с учётом price_override на конкретные даты
        /// </summary>
        public async Task<decimal> CalculateTotalPriceAsync(int propertyId, DateOnly checkIn, DateOnly checkOut)
        {
            // Получаем базовую цену объекта
            var property = await _context.Properties
                .FirstOrDefaultAsync(p => p.PropertyId == propertyId);

            if (property == null)
                throw new Exception("Объект не найден");

            // Получаем все переопределения цен на нужные даты
            var dateOverrides = await _context.PropertyAvailabilities
                .Where(pa => pa.PropertyId == propertyId &&
                             pa.PriceOverride.HasValue &&
                             pa.Date >= checkIn &&
                             pa.Date < checkOut)
                .ToDictionaryAsync(pa => pa.Date, pa => pa.PriceOverride.Value);

            decimal total = 0;
            for (var date = checkIn; date < checkOut; date = date.AddDays(1))
            {
                // Если есть переопределение цены на эту дату — используем его
                if (dateOverrides.TryGetValue(date, out var overridePrice))
                {
                    total += overridePrice;
                }
                else
                {
                    total += property.PricePerNight;
                }
            }

            return total;
        }

        public async Task<List<Booking>> GetByRenterIdAsync(int renterId)
        {
            return await _context.Bookings
                .Include(b => b.Property)
                    .ThenInclude(p => p!.PropertyPhotos)
                .Include(b => b.Property)
                    .ThenInclude(p => p!.Owner)
                .Include(b => b.Status)
                .Where(b => b.RenterId == renterId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Booking>> GetByOwnerIdAsync(int ownerId)
        {
            return await _context.Bookings
                .Include(b => b.Property)
                    .ThenInclude(p => p!.PropertyPhotos)
                .Include(b => b.Renter)
                .Include(b => b.Status)
                .Where(b => b.Property != null && b.Property.OwnerId == ownerId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> UpdateStatusAsync(int bookingId, int statusId)
        {
            var booking = await _context.Bookings.FindAsync(bookingId);
            if (booking == null) return false;

            booking.StatusId = statusId;
            booking.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> IsRenterAsync(int bookingId, int userId)
        {
            return await _context.Bookings
                .AnyAsync(b => b.BookingId == bookingId && b.RenterId == userId);
        }

        public async Task<bool> IsOwnerOfBookingAsync(int bookingId, int userId)
        {
            return await _context.Bookings
                .AnyAsync(b => b.BookingId == bookingId &&
                               b.Property != null &&
                               b.Property.OwnerId == userId);
        }

        /// <summary>
        /// Проверяет, может ли пользователь оставить отзыв на это бронирование
        /// </summary>
        public async Task<bool> CanLeaveReviewAsync(int bookingId, int userId)
        {
            // Проверка, что бронирование принадлежит пользователю,
            // статус "Завершено" (booking_status.id = 5),
            // и отзыв ещё не оставлен
            return await _context.Bookings
                .AnyAsync(b => b.BookingId == bookingId &&
                               b.RenterId == userId &&
                               b.StatusId == 5 &&
                               !_context.Reviews.Any(r => r.BookingId == bookingId));
        }

        /// <summary>
        /// Завершает все истёкшие бронирования (меняет статус на Завершено)
        /// </summary>
        public async Task<int> CompleteExpiredBookingsAsync()
        {
            var expiredBookings = await _context.Bookings
                .Where(b => b.StatusId == 2 &&
                            b.CheckOutDate < DateOnly.FromDateTime(DateTime.UtcNow))
                .ToListAsync();

            foreach (var booking in expiredBookings)
            {
                booking.StatusId = 5;
            }

            await _context.SaveChangesAsync();
            return expiredBookings.Count;
        }

        public async Task<List<Booking>> GetPastBookingsForRenterAsync(int renterId)
        {
            return await _context.Bookings
                .Include(b => b.Property)
                    .ThenInclude(p => p!.PropertyPhotos)
                .Include(b => b.Property)
                    .ThenInclude(p => p!.Owner)
                .Include(b => b.Status)
                .Where(b => b.RenterId == renterId &&
                            (b.StatusId == 5 || b.StatusId == 3 || b.StatusId == 4) && // завершено, отменено, отклонено
                            b.CheckOutDate < DateOnly.FromDateTime(DateTime.UtcNow))
                .OrderByDescending(b => b.CheckOutDate)
                .ToListAsync();
        }

        public async Task<List<Booking>> GetPastBookingsForOwnerAsync(int ownerId)
        {
            return await _context.Bookings
                .Include(b => b.Property)
                    .ThenInclude(p => p!.PropertyPhotos)
                .Include(b => b.Renter)
                .Include(b => b.Status)
                .Where(b => b.Property != null &&
                            b.Property.OwnerId == ownerId &&
                            (b.StatusId == 5 || b.StatusId == 3 || b.StatusId == 4))
                .OrderByDescending(b => b.CheckOutDate)
                .ToListAsync();
        }

        public async Task<List<Booking>> GetBookingRequestsForOwnerAsync(int ownerId)
        {
            return await _context.Bookings
                .Include(b => b.Property)
                    .ThenInclude(p => p!.PropertyPhotos)
                .Include(b => b.Renter)
                .Include(b => b.Status)
                .Where(b => b.Property != null &&
                            b.Property.OwnerId == ownerId &&
                            b.StatusId == 1) // Ожидает подтверждения
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Booking>> GetCompletedBookingsForOwnerAsync(int ownerId)
        {
            return await _context.Bookings
                .Include(b => b.Property)
                    .ThenInclude(p => p!.PropertyPhotos)
                .Include(b => b.Renter)
                .Include(b => b.Status)
                .Where(b => b.Property != null &&
                            b.Property.OwnerId == ownerId &&
                            b.StatusId == 5) // Завершено
                .OrderByDescending(b => b.CheckOutDate)
                .ToListAsync();
        }
    }
}

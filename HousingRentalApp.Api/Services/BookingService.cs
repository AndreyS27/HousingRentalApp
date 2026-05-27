using HousingRentalApp.Api.Data.Repositories;
using HousingRentalApp.Api.DTOs;
using HousingRentalApp.Api.Models;

namespace HousingRentalApp.Api.Services
{
    public class BookingService : IBookingService
    {
        // Статусы бронирований
        // 1	"Ожидает подтверждения"
        // 2	"Подтверждено"
        // 3	"Отменено арендатором"
        // 4	"Отклонено арендодателем"
        // 5	"Завершено"

        // Статусы платежей
        //1 "Ожидает оплаты"
        //2 "Оплачено"
        //3 "Ошибка оплаты"
        //4 "Отменено"
        //5 "Средства возвращены"

        private readonly IBookingRepository _bookingRepository;
        private readonly IPropertyRepository _propertyRepository;
        private readonly IPaymentRepository _paymentRepository;

        public BookingService(
            IBookingRepository bookingRepository, 
            IPropertyRepository propertyRepository, 
            IPaymentRepository paymentRepository)
        {
            _bookingRepository = bookingRepository;
            _propertyRepository = propertyRepository;
            _paymentRepository = paymentRepository;
        }

        public async Task<Booking?> CreateBookingAsync(int renterId, CreateBookingRequest request)
        {
            if (request.CheckInDate >= request.CheckOutDate)
                throw new ArgumentException("Дата выезда должна быть позже даты заезда");

            if (request.CheckInDate < DateOnly.FromDateTime(DateTime.UtcNow))
                throw new ArgumentException("Нельзя забронировать прошедшие даты");

            var property = await _propertyRepository.GetByIdAsync(request.PropertyId);

            if (property == null)
                throw new Exception("Объект не найден");

            if (request.GuestsCount > property.GuestsCount)
                throw new Exception($"Максимальное количество гостей: {property.GuestsCount}");

            var isAvailable = await _bookingRepository.IsAvailableAsync(
                request.PropertyId, request.CheckInDate, request.CheckOutDate);

            if (!isAvailable)
                throw new Exception("Выбранные даты недоступны для бронирования");

            var totalPrice = await _bookingRepository.CalculateTotalPriceAsync(
                request.PropertyId, request.CheckInDate, request.CheckOutDate);

            var booking = new Booking
            {
                PropertyId = request.PropertyId,
                RenterId = renterId,
                StatusId = 1, // ожидает подтверждения от арендодателя
                CheckInDate = request.CheckInDate,
                CheckOutDate = request.CheckOutDate,
                GuestsCount = request.GuestsCount,
                TotalPrice = totalPrice
            };

            booking = await _bookingRepository.CreateAsync(booking);

            var payment = new Payment
            {
                BookingId = booking.BookingId,
                PaymentStatusId = 1, // платёж ожидает оплаты
                Amount = totalPrice,
            };

            await _paymentRepository.CreateAsync(payment);

            return booking;
        }

        /// <summary>
        /// Отмена бронирования арендатором
        /// </summary>
        public async Task<bool> CancelBookingAsync(int bookingId, int userId)
        {
            var isRenter = await _bookingRepository.IsRenterAsync(bookingId, userId);
            if (!isRenter)
                throw new UnauthorizedAccessException("Вы не можете отменить это бронирование");

            var booking = await _bookingRepository.GetByIdAsync(bookingId);
            if (booking == null)
                return false;

            if (booking.StatusId == 5)
                throw new Exception("Нельзя отменить завершённое бронирование");

            if (booking.StatusId == 2)
            {
                // Проверяем, что до заезда больше одного дня (правило отмены)
                if (booking.CheckInDate <= DateOnly.FromDateTime(DateTime.UtcNow).AddDays(1))
                    throw new Exception("Отмена невозможна: до заезда менее 24 часов");
            }

            booking.StatusId = 3; // отменено арендатором
            await _bookingRepository.UpdateAsync(booking);

            // Если был оплачен — создаётся возврат
            var payment = await _paymentRepository.GetPaymentByBookingIdAsync(bookingId);
            if (payment != null && payment.PaymentStatusId == 2)
            {
                payment.PaymentStatusId = 5;
                payment.UpdatedAt = DateTime.UtcNow;
                await _paymentRepository.UpdateAsync(payment);
            }

            return true;
        }

        /// <summary>
        /// Получение всех бронирований текущего пользователя (как арендатора)
        /// </summary>
        public async Task<List<BookingResponse>> GetMyBookingsAsync(int userId)
        {
            var bookings = await _bookingRepository.GetByRenterIdAsync(userId);
            return bookings.Select(b => MapToResponse(b)).ToList();
        }

        /// <summary>
        /// Получение всех бронирований объектов текущего пользователя (как арендодателя)
        /// </summary>
        public async Task<List<BookingResponse>> GetBookingsForMyPropertiesAsync(int ownerId)
        {
            var bookings = await _bookingRepository.GetByOwnerIdAsync(ownerId);
            return bookings.Select(b => MapToResponse(b)).ToList();
        }

        /// <summary>
        /// Подтверждение бронирования арендодателем
        /// </summary>
        public async Task<bool> ConfirmBookingAsync(int bookingId, int ownerId)
        {
            // Проверяем, что пользователь — владелец объекта
            var isOwner = await _bookingRepository.IsOwnerOfBookingAsync(bookingId, ownerId);
            if (!isOwner)
                throw new UnauthorizedAccessException("Вы не можете подтвердить это бронирование");

            var booking = await _bookingRepository.GetByIdAsync(bookingId);
            if (booking == null)
                return false;

            // Проверяем, что бронирование оплачено
            var payment = await _paymentRepository.GetPaymentByBookingIdAsync(bookingId);
            if (payment == null || payment.PaymentStatusId != 2)
                throw new Exception("Бронирование не оплачено");

            // Меняем статус
            booking.StatusId = 2;
            await _bookingRepository.UpdateAsync(booking);

            // TODO: заблокировать даты в PropertyAvailability
            // Это можно сделать здесь или отдельным методом

            return true;
        }

        /// <summary>
        /// Отклонение бронирования арендодателем
        /// </summary>
        public async Task<bool> RejectBookingAsync(int bookingId, int ownerId)
        {
            var isOwner = await _bookingRepository.IsOwnerOfBookingAsync(bookingId, ownerId);
            if (!isOwner)
                throw new UnauthorizedAccessException("Вы не можете отклонить это бронирование");

            var booking = await _bookingRepository.GetByIdAsync(bookingId);
            if (booking == null)
                return false;

            // Можно отклонить только если статус "Ожидает подтверждения"
            if (booking.StatusId != 1)
                throw new Exception("Нельзя отклонить это бронирование в текущем статусе");

            booking.StatusId = 4;
            await _bookingRepository.UpdateAsync(booking);

            // Возврат средств, если были оплачены
            var payment = await _paymentRepository.GetPaymentByBookingIdAsync(bookingId);
            if (payment != null && payment.PaymentStatusId == 2)
            {
                payment.PaymentStatusId = 5;
                payment.UpdatedAt = DateTime.UtcNow;
                await _paymentRepository.UpdateAsync(payment);
            }

            return true;
        }

        public async Task<BookingResponse?> GetBookingDetailsAsync(int bookingId, int userId)
        {
            // Пользователь должен быть либо арендатором, либо владельцем объекта
            var isRenter = await _bookingRepository.IsRenterAsync(bookingId, userId);
            var isOwner = await _bookingRepository.IsOwnerOfBookingAsync(bookingId, userId);

            if (!isRenter && !isOwner)
                return null;

            var booking = await _bookingRepository.GetByIdAsync(bookingId);
            if (booking == null) return null;

            return MapToResponse(booking);
        }

        public async Task<bool> CanLeaveReviewAsync(int bookingId, int userId)
        {
            return await _bookingRepository.CanLeaveReviewAsync(bookingId, userId);
        }

        public async Task<int> CompleteExpiredBookingsAsync()
        {
            return await _bookingRepository.CompleteExpiredBookingsAsync();
        }

        public async Task<List<BookingResponse>> GetMyPastBookingsAsync(int userId)
        {
            var bookings = await _bookingRepository.GetPastBookingsForRenterAsync(userId);
            return bookings.Select(b => MapToResponse(b)).ToList();
        }

        public async Task<List<BookingResponse>> GetBookingRequestsForOwnerAsync(int ownerId)
        {
            var bookings = await _bookingRepository.GetBookingRequestsForOwnerAsync(ownerId);
            return bookings.Select(b => MapToResponse(b)).ToList();
        }

        public async Task<List<BookingResponse>> GetPastBookingsForOwnerAsync(int ownerId)
        {
            var bookings = await _bookingRepository.GetPastBookingsForOwnerAsync(ownerId);
            return bookings.Select(b => MapToResponse(b)).ToList();
        }

        public async Task<List<ReviewResponse>> GetReviewsForOwnerAsync(int ownerId)
        {
            var completedBookings = await _bookingRepository.GetCompletedBookingsForOwnerAsync(ownerId);

            var reviews = new List<ReviewResponse>();
            foreach (var booking in completedBookings)
            {
                var review = booking.Review;
                if (review != null)
                {
                    reviews.Add(new ReviewResponse
                    {
                        ReviewId = review.ReviewId,
                        BookingId = review.BookingId,
                        PropertyId = booking.PropertyId,
                        Rating = review.Rating,
                        Comment = review.Comment,
                        ReviewerName = booking.Renter != null
                            ? $"{booking.Renter.FirstName} {booking.Renter.LastName}"
                            : "Неизвестный",
                        CreatedAt = review.CreatedAt
                    });
                }
            }

            return reviews;
        }

        // Приватный метод для преобразования Booking -> BookingResponse
        private BookingResponse MapToResponse(Booking booking)
        {
            // Проверяем статус платежа (если есть)
            var payment = booking.Payments?.FirstOrDefault();
            string? paymentStatus = null;
            if (payment != null)
            {
                paymentStatus = payment.PaymentStatus?.StatusName ??
                    (payment.PaymentStatusId == 2 ? "paid" :
                     payment.PaymentStatusId == 1 ? "pending" :
                     payment.PaymentStatusId == 3 ? "failed" : "refunded");
            }

            // Находим главное фото объекта
            var mainPhoto = booking.Property?.PropertyPhotos?
                .FirstOrDefault(p => p.IsMain)?.PhotoUrl
                ?? booking.Property?.PropertyPhotos?.FirstOrDefault()?.PhotoUrl
                ?? string.Empty;

            return new BookingResponse
            {
                BookingId = booking.BookingId,
                PropertyId = booking.PropertyId,
                PropertyTitle = booking.Property?.Title ?? "Не указано",
                PropertyAddress = booking.Property?.Address ?? "Не указан",
                PropertyMainPhoto = mainPhoto,
                RenterName = booking.Renter != null
                    ? $"{booking.Renter.FirstName} {booking.Renter.LastName}"
                    : "Неизвестный",
                Status = booking.Status?.StatusName ?? "Неизвестен",
                CheckInDate = booking.CheckInDate,
                CheckOutDate = booking.CheckOutDate,
                GuestsCount = booking.GuestsCount,
                TotalPrice = booking.TotalPrice,
                CreatedAt = booking.CreatedAt,
                PaymentStatus = paymentStatus,
                CanReview = false // Заполняется отдельно при необходимости
            };
        }
    }
}

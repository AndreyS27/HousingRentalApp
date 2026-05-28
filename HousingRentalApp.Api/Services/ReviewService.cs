using HousingRentalApp.Api.Data.Repositories;
using HousingRentalApp.Api.DTOs;
using HousingRentalApp.Api.Models;

namespace HousingRentalApp.Api.Services
{
    public class ReviewService : IReviewService
    {
        private readonly IReviewRepository _reviewRepository;
        private readonly IBookingRepository _bookingRepository;
        private readonly IPropertyRepository _propertyRepository;

        public ReviewService(
            IReviewRepository reviewRepository,
            IBookingRepository bookingRepository,
            IPropertyRepository propertyRepository)
        {
            _reviewRepository = reviewRepository;
            _bookingRepository = bookingRepository;
            _propertyRepository = propertyRepository;
        }

        public async Task<ReviewResponse> CreateReviewAsync(int userId, CreateReviewRequest request)
        {
            // Проверка на существование бронирования и принадлежность пользователю
            var booking = await _bookingRepository.GetByIdAsync(request.BookingId);

            if (booking == null) 
                throw new Exception("Бронирование не найдено");

            if (booking.RenterId != userId)
                throw new UnauthorizedAccessException("Вы не можете оставить отзыв на это броинрование");

            // Проверяем что бронирование завершено (статус 5)
            if (booking.StatusId != 5)
                throw new Exception("Отзыв можно оставить только после завершения бронирования");

            // Проверяем, что отзыв ешё не оставлен
            var reviewExists = await _reviewRepository.ReviewExistsForBookingAsync(request.BookingId);
            if (reviewExists)
                throw new Exception("Отзыв на это бронирование уже оставлен");

            // Проверяем, что объект существует
            var property = await _propertyRepository.GetByIdAsync(booking.PropertyId);

            if (property == null)
                throw new Exception("Объект не найден");

            var review = new Review
            {
                BookingId = booking.BookingId,
                PropertyId = booking.PropertyId,
                ReviewerId = userId,
                Rating = request.Rating,
                Comment = request.Comment,
            };

            review = await _reviewRepository.CreateAsync(review);

            return MapToResponse(review);
        }

        public async Task<ReviewResponse?> UpdateReviewAsync(int userId, int reviewId, UpdateReviewRequest request)
        {
            var review = await _reviewRepository.GetByIdAsync(reviewId);
            if (review == null)
                return null;

            if (review.ReviewerId != userId)
                throw new UnauthorizedAccessException("Вы не можете редактировать этот отзыв");

            review.Rating = request.Rating;
            review.Comment = request.Comment;

            review = await _reviewRepository.UpdateAsync(review);

            return MapToResponse(review);
        }

        public async Task<bool> DeleteReviewAsync(int userId, int reviewId)
        {
            var review = await _reviewRepository.GetByIdAsync(reviewId);
            if (review == null)
                return false;

            if (review.ReviewerId != userId)
                throw new UnauthorizedAccessException("Вы не можете удалить этот отзыв");

            return await _reviewRepository.DeleteAsync(reviewId);
        }

        public async Task<List<ReviewResponse>> GetMyReviewsAsync(int userId)
        {
            var reviews = await _reviewRepository.GetByRenterIdAsync(userId);
            return reviews.Select(MapToResponse).ToList();
        }

        public async Task<List<ReviewResponse>> GetReviewsForOwnerAsync(int ownerId)
        {
            var reviews = await _reviewRepository.GetByOwnerIdAsync(ownerId);
            return reviews.Select(MapToResponse).ToList();
        }

        public async Task<bool> CanReviewAsync(int userId, int bookingId)
        {
            return await _bookingRepository.CanLeaveReviewAsync(bookingId, userId);
        }

        private ReviewResponse MapToResponse(Review review)
        {
            return new ReviewResponse
            {
                ReviewId = review.ReviewId,
                BookingId = review.BookingId,
                PropertyId = review.PropertyId,
                PropertyTitle = review.Booking?.Property?.Title ?? "Не указано",
                Rating = review.Rating,
                Comment = review.Comment,
                ReviewerName = review.Reviewer != null
                    ? $"{review.Reviewer.FirstName} {review.Reviewer.LastName}"
                    : "Неизвестный",
                CreatedAt = review.CreatedAt
            };
        }
    }
}

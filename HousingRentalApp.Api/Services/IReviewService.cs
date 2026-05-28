using HousingRentalApp.Api.DTOs;

namespace HousingRentalApp.Api.Services
{
    public interface IReviewService
    {
        Task<ReviewResponse> CreateReviewAsync(int userId, CreateReviewRequest request);
        Task<ReviewResponse?> UpdateReviewAsync(int userId, int reviewId, UpdateReviewRequest request);
        Task<bool> DeleteReviewAsync(int userId, int reviewId);
        Task<List<ReviewResponse>> GetMyReviewsAsync(int userId);
        Task<List<ReviewResponse>> GetReviewsForOwnerAsync(int ownerId);
        Task<bool> CanReviewAsync(int userId, int bookingId);
        Task<List<ReviewResponse>> GetReviewsByPropertyIdAsync(int propertyId);
    }
}

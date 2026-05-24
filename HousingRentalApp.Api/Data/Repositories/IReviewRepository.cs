using HousingRentalApp.Api.Models;

namespace HousingRentalApp.Api.Data.Repositories
{
    public interface IReviewRepository
    {
        Task<Review?> GetByIdAsync(int reviewId);
        Task<Review> CreateAsync(Review review);
        Task<Review> UpdateAsync(Review review);
        Task<bool> DeleteAsync(int reviewId);
        Task<List<Review>> GetByRenterIdAsync(int renterId);
        Task<List<Review>> GetByOwnerIdAsync(int ownerId);
        Task<bool> ReviewExistsForBookingAsync(int bookingId);
    }
}
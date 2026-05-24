using HousingRentalApp.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HousingRentalApp.Api.Data.Repositories
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly ApplicationDbContext _context;

        public ReviewRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Review?> GetByIdAsync(int reviewId)
        {
            return await _context.Reviews
                .Include(r => r.Booking)
                    .ThenInclude(b => b!.Property)
                .Include(r => r.Reviewer)
                .FirstOrDefaultAsync(r => r.ReviewId == reviewId);
        }

        public async Task<Review> CreateAsync(Review review)
        {
            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();
            return review;
        }

        public async Task<Review> UpdateAsync(Review review)
        {
            _context.Reviews.Update(review);
            await _context.SaveChangesAsync();
            return review;
        }

        public async Task<bool> DeleteAsync(int reviewId)
        {
            var review = await _context.Reviews.FindAsync(reviewId);
            if (review == null) return false;
            
            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Review>> GetByRenterIdAsync(int renterId)
        {
            return await _context.Reviews
                .Include(r => r.Booking)
                    .ThenInclude(b => b!.Property)
                .Where(r => r.ReviewerId == renterId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Review>> GetByOwnerIdAsync(int ownerId)
        {
            return await _context.Reviews
                .Include(r => r.Booking)
                    .ThenInclude(b => b!.Property)
                .Include(r => r.Reviewer)
                .Where(r => r.Booking != null && 
                            r.Booking.Property != null && 
                            r.Booking.Property.OwnerId == ownerId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> ReviewExistsForBookingAsync(int bookingId)
        {
            return await _context.Reviews.AnyAsync(r => r.BookingId == bookingId);
        }
    }
}
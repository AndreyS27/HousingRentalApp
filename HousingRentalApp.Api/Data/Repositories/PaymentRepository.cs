using HousingRentalApp.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HousingRentalApp.Api.Data.Repositories
{
    public class PaymentRepository : IPaymentRepository
    {
        private readonly ApplicationDbContext _context;

        public PaymentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Payment> CreateAsync(Payment payment)
        {
            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();
            return payment;
        }

        public async Task<Payment?> GetPaymentByBookingIdAsync(int bookingId)
        {
            return await _context.Payments
                .Include(p => p.PaymentStatus)
                .FirstOrDefaultAsync(p => p.BookingId == bookingId);
        }

        public async Task<Payment> UpdateAsync(Payment payment)
        {
            _context.Payments.Update(payment);
            await _context.SaveChangesAsync();
            return payment;
        }
    }
}

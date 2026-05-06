using HousingRentalApp.Api.Models;

namespace HousingRentalApp.Api.Data.Repositories
{
    public interface IPaymentRepository
    {
        Task<Payment> CreateAsync(Payment payment);
        Task<Payment?> GetPaymentByBookingIdAsync(int bookingId);
        Task<Payment> UpdateAsync(Payment payment);
    }
}

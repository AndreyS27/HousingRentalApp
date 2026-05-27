using HousingRentalApp.Api.DTOs;

namespace HousingRentalApp.Api.Services
{
    public interface IPaymentService
    {
        Task<PaymentResult> ProcessPaymentAsync(int bookingId, string paymentMethod);
    }
}

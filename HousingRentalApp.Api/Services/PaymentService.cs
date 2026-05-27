using HousingRentalApp.Api.Data.Repositories;
using HousingRentalApp.Api.DTOs;

namespace HousingRentalApp.Api.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IPaymentRepository _paymentRepository;
        private readonly IBookingRepository _bookingRepository;

        public PaymentService(IPaymentRepository paymentRepository, IBookingRepository bookingRepository)
        {
            _paymentRepository = paymentRepository;
            _bookingRepository = bookingRepository;
        }

        public async Task<PaymentResult> ProcessPaymentAsync(int bookingId, string paymentMethod)
        {
            // Имитация оплаты (всегда успешна)

            var payment = await _paymentRepository.GetPaymentByBookingIdAsync(bookingId);

            if (payment == null) 
                return new PaymentResult { Success = false, ErrorMessage = "Платёж не найден" };

            if (payment.PaymentStatusId == 2) // Уже оплачено
                return new PaymentResult { Success = false, ErrorMessage = "Бронирование уже оплачено" };

            // Имитация задержки обработки платежа
            await Task.Delay(500);

            // Всегда успешно для диплома
            var transactionId = Guid.NewGuid().ToString();

            payment.PaymentStatusId = 2; // Оплачено
            payment.TransactionId = transactionId;
            payment.PaymentMethod = paymentMethod;

            await _paymentRepository.UpdateAsync(payment);

            // Обновляем статус бронирования на "Ожидает подтверждения" (status_id = 1)
            await _bookingRepository.UpdateStatusAsync(bookingId, 1);

            return new PaymentResult
            {
                Success = true,
                TransactionId = transactionId,
            };
        }
    }
}

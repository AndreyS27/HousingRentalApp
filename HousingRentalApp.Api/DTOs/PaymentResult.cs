namespace HousingRentalApp.Api.DTOs
{
    public class PaymentResult
    {
        public bool Success { get; set; }
        public string TransactionId { get; set; } = string.Empty;
        public string? ErrorMessage { get; set; }
        public DateTime PaymentDate { get; set; }
    }
}

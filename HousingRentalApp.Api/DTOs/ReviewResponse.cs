namespace HousingRentalApp.Api.DTOs
{
    public class ReviewResponse
    {
        public int ReviewId { get; set; }
        public int BookingId { get; set; }
        public int PropertyId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public string ReviewerName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}

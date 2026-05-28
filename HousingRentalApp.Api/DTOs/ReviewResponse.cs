namespace HousingRentalApp.Api.DTOs
{
    public class ReviewResponse
    {
        public int ReviewId { get; set; }
        public int BookingId { get; set; }
        public int PropertyId { get; set; }
        public string PropertyTitle { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public string ReviewerName { get; set; } = string.Empty;
        public string? ReviewerAvatarUrl { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

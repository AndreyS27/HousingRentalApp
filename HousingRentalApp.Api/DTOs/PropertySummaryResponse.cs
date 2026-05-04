namespace HousingRentalApp.Api.DTOs
{
    public class PropertySummaryResponse
    {
        public int PropertyId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string MainPhotoUrl { get; set; } = string.Empty;
        public decimal PricePerNight { get; set; }
        public double? AverageRating { get; set; }
        public int GuestsCount { get; set; }
        public int BedroomsCount { get; set; }
    }
}

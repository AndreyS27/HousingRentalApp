namespace HousingRentalApp.Api.DTOs
{
    public class PropertySummaryResponse
    {
        public int PropertyId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string MainPhotoUrl { get; set; } = string.Empty;
        public List<string> Photos { get; set; }
        public decimal PricePerNight { get; set; }
        public double? AverageRating { get; set; }
        public int GuestsCount { get; set; }
        public int BedroomsCount { get; set; }
        public int BedsCount { get; set; }
        public decimal? Latitude {  get; set; }
        public decimal? Longitude { get; set; }
        public bool IsActive { get; set; }
        public int ViewCount { get; set; }
    }
}

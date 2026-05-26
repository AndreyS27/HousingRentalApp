namespace HousingRentalApp.Api.DTOs
{
    public class PropertyResponse
    {
        public int PropertyId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public int GuestsCount { get; set; }
        public int BedroomsCount { get; set; }
        public int BedsCount { get; set; }
        public decimal BathroomsCount { get; set; }
        public decimal PricePerNight { get; set; }
        public bool IsActive { get; set; }
        public string OwnerName { get; set; } = string.Empty;
        public string PropertyType { get; set; } = string.Empty;
        public int PropertyTypeId { get; set; }
        public List<string> Amenities { get; set; } = new List<string>();
        public List<int> AmenityIds { get; set; } = new List<int>();
        public List<PropertyPhotoDto> Photos { get; set; } = new List<PropertyPhotoDto>();
        public double? AverageRating { get; set; }
        public int ReviewsCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<DateOverrideDto> DateOverrides { get; set; } = new List<DateOverrideDto>();
    }
}

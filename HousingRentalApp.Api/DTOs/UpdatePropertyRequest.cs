namespace HousingRentalApp.Api.DTOs
{
    public class UpdatePropertyRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public int? GuestsCount { get; set; }
        public int? BedroomsCount { get; set; }
        public int? BedsCount { get; set; }
        public int? BathroomsCount { get; set; }
        public decimal? PricePerNight { get; set; }
        public int? PropertyTypeId { get; set; }
        public bool? IsActive { get; set; }
        public List<int>? AmenityIds { get; set; }
        public List<DateOverrideDto>? DateOverrides { get; set; }
        //public List<string>? PhotosToDelete { get; set; }
        public List<int>? PhotosToDeleteIds { get; set; }
    }
}

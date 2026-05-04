namespace HousingRentalApp.Api.DTOs
{
    public class CreatePropertyRequest
    {
        public string Title { get; set; } = null!;

        public string? Description { get; set; }

        public string Address { get; set; } = null!;

        public string City { get; set; } = null!;

        public decimal? Latitude { get; set; }

        public decimal? Longitude { get; set; }

        public int GuestsCount { get; set; }

        public int BedroomsCount { get; set; }

        public int BedsCount { get; set; }

        public int BathroomsCount { get; set; }

        public decimal PricePerNight { get; set; }
        public int PropertyTypeId { get; set; }
        public List<int> AmenityIds { get; set; } = new List<int>();
    }
}

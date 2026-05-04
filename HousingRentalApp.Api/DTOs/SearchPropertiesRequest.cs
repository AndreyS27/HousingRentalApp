namespace HousingRentalApp.Api.DTOs
{
    public class SearchPropertiesRequest
    {
        public string? City { get; set; }
        public DateOnly? CheckInDate { get; set; }
        public DateOnly? CheckOutDate { get; set; }
        public int? GuestsCount { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public int? PropertyTypeId { get; set; }
        public int? BedroomsCount { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}

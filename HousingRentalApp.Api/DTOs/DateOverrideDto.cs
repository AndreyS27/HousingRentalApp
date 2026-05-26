namespace HousingRentalApp.Api.DTOs
{
    public class DateOverrideDto
    {
        public DateOnly Date {  get; set; }
        public bool IsAvailable { get; set; }
        public decimal? PriceOverride { get; set; }
    }
}

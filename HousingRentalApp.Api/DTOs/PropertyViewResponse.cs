namespace HousingRentalApp.Api.DTOs
{
    public class PropertyViewResponse
    {
        public int PropertyId { get; set; }
        public int TotalViews { get; set; }
        public int ViewsLastWeek { get; set; }
        public int ViewsLastMonth { get; set; }
        public List<DailyViewsDto>? DailyViews { get; set; }
    }
}

namespace HousingRentalApp.Api.DTOs
{
    public class CreateBookingRequest
    {
        public int PropertyId { get; set; }
        public DateOnly CheckInDate { get; set; }
        public DateOnly CheckOutDate { get; set; }
        public int GuestsCount { get; set; }
    }
}

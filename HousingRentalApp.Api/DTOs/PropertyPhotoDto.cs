namespace HousingRentalApp.Api.DTOs
{
    public class PropertyPhotoDto
    {
        public int PhotoId { get; set; }
        public string PhotoUrl { get; set; } = string.Empty;
        public bool IsMain { get; set; }
        public DateTime UploadedAt { get; set; }
    }
}

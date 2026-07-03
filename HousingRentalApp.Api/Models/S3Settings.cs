namespace HousingRentalApp.Api.Models
{
    public class S3Settings
    {
        public string ServiceURL { get; set; } = string.Empty;
        public string BucketName {  get; set; } = string.Empty;
        public string AccessKey { get; set; } = string.Empty;
        public string SecretKey {  get; set; } = string.Empty;
    }
}

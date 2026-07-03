namespace HousingRentalApp.Api.Services
{
    public interface IS3Service
    {
        Task<string> UploadPropertyPhotoAsync(IFormFile file);
        Task DeletePropertyPhotoAsync(string fileUrl);
    }
}

using Amazon.S3;
using Amazon.S3.Model;

namespace HousingRentalApp.Api.Services
{
    public class S3Service : IS3Service
    {
        private readonly IAmazonS3 _s3Client;
        private readonly string _bucketName;
        private readonly string _serviceUrl;

        public S3Service(IAmazonS3 s3Client, IConfiguration configuration)
        {
            _s3Client = s3Client;
            _bucketName = configuration["S3Settings:BucketName"];
            _serviceUrl = configuration["S3Settings:ServiceUrl"];
        }

        public async Task<string> UploadPropertyPhotoAsync(IFormFile file)
        {
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.Name)}";

            using var stream = file.OpenReadStream();
            var putRequest = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = $"properties/{fileName}",
                InputStream = stream,
                ContentType = file.ContentType ?? "application/octet-stream",
                CannedACL = S3CannedACL.PublicRead,
                Headers =
                {
                    ["Content-Disposition"] = $"inline; filename=\"{fileName}\""
                }
            };

            var response = await _s3Client.PutObjectAsync(putRequest);

            return $"{_serviceUrl}/{_bucketName}/properties/{fileName}";
        }

        public async Task DeletePropertyPhotoAsync(string fileUrl)
        {
            try
            {
                var uri = new Uri(fileUrl);
                var fullPath = uri.AbsolutePath.TrimStart('/');

                var key = fullPath;
                if (key.StartsWith($"{_bucketName}/"))
                {
                    key = key.Substring($"{_bucketName}/".Length);
                }

                var deleteRequest = new DeleteObjectRequest
                {
                    BucketName = _bucketName,
                    Key = key
                };

                var response = await _s3Client.DeleteObjectAsync(deleteRequest);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка удаления файла из S3: {ex.Message}");
            }
        }
    }
}

using HousingRentalApp.Api.DTOs;

namespace HousingRentalApp.Api.Services
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);
        string HashPassword(string password);
        bool VerifyPassword(string password, string hash);
    }
}

using HousingRentalApp.Api.Models;

namespace HousingRentalApp.Api.Data.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByIdAsync(int id);
        Task<User> CreateAsync(User user);
        Task<bool> EmailExistsAsync(string email);
    }
}

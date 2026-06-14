using HousingRentalApp.Api.DTOs;

namespace HousingRentalApp.Api.Data.Repositories
{
    public interface IPropertyViewRepository
    {
        Task AddViewAsync(int propertyId, int? userId, string? ipAddress);
        Task<int> GetViewCountAsync(int propertyId);
        Task<int> GetViewCountForPeriodAsync(int propertyId, DateTime startDate);
        Task<List<DailyViewsDto>> GetDailyViewsAsync(int propertyId, int days);
    }
}

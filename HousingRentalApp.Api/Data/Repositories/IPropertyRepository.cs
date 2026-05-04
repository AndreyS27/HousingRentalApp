using HousingRentalApp.Api.Models;

namespace HousingRentalApp.Api.Data.Repositories
{
    public interface IPropertyRepository
    {
        // CRUD'ы
        Task<Property?> GetByIdAsync(int propertyId);
        Task<Property> CreateAsync(Property property);
        Task<Property> UpdateAsync(Property property);
        Task<bool> DeleteAsync(int propertyId);

        // Поиск и фильтрация
        Task<List<Property>> SearchAsync(string? city, DateOnly? checkIn, DateOnly? checkOut,
            int? guestsCount, decimal? minPrice, decimal? maxPrice,
            int? propertyTypeId, int? bedroomsCount, int page, int pageSize);

        Task<int> GetSearchCountAsync(string? city, DateOnly? checkIn, DateOnly? checkOut,
            int? guestsCount, decimal? minPrice, decimal? maxPrice,
            int? propertyTypeId, int? bedroomsCount);

        // Для арендодателя
        Task<List<Property>> GetByOwnerIdAsync(int ownerId);
        Task<bool> IsOwnerAsync(int propertyId, int userId);

        // Управление удобствами
        Task AddAmenitiesToPropertyAsync(int propertyId, List<int> amenityIds);
        Task RemoveAllAmenitiesAsync(int propertyId);

        // Проверка существования
        Task<bool> ExistsAsync(int propertyId);
    }
}

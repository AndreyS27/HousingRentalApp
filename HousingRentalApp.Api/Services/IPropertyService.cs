using HousingRentalApp.Api.DTOs;
using HousingRentalApp.Api.Models;
using System.Net;

namespace HousingRentalApp.Api.Services
{
    public interface IPropertyService
    {
        Task<PropertyResponse?> GetPropertyByIdAsync(int propertyId);
        Task<PropertyResponse?> GetPropertyByIdAsync(int propertyId, int? currentUserId, string? ipAddress);
        Task<(List<PropertySummaryResponse> Properties, int TotalCount)> SearchPropertiesAsync(SearchPropertiesRequest request);

        Task<PropertyResponse> CreatePropertyAsync(int ownerId, CreatePropertyRequest request);
        Task<PropertyResponse?> UpdatePropertyAsync(int propertyId, int userId, UpdatePropertyRequest request);
        Task<bool> DeletePropertyAsync(int propertyId, int userId);
        Task<List<PropertySummaryResponse>> GetMyPropertiesAsync(int ownerId);

        Task<bool> IsOwnerAsync(int propertyId, int userId);
    }
}

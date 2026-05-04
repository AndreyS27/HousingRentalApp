using HousingRentalApp.Api.DTOs;

namespace HousingRentalApp.Api.Services
{
    public interface IPropertyService
    {
        Task<PropertyResponse> CreateProperyAsync(int ownerId, CreatePropertyRequest request);

    }
}

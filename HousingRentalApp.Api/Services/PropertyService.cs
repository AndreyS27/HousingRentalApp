using HousingRentalApp.Api.Data.Repositories;
using HousingRentalApp.Api.DTOs;
using HousingRentalApp.Api.Models;

namespace HousingRentalApp.Api.Services
{
    public class PropertyService : IPropertyService
    {
        private readonly IPropertyRepository _propertyRepository;

        public PropertyService(IPropertyRepository propertyRepository)
        {
            _propertyRepository = propertyRepository;
        }

        public async Task<PropertyResponse?> GetPropertyByIdAsync(int propertyId)
        {
            var property = await _propertyRepository.GetByIdAsync(propertyId);
            if (property == null) return null;

            return MapToResponse(property);
        }

        public async Task<PropertyResponse> CreateProperyAsync(int ownerId, CreatePropertyRequest request)
        {
            var property = new Property
            {
                OwnerId = ownerId,
                Title = request.Title,
                Description = request.Description,
                Address = request.Address,
                City = request.City,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                GuestsCount = request.GuestsCount,
                BedroomsCount = request.BedroomsCount,
                BedsCount = request.BedsCount,
                BathroomsCount = request.BathroomsCount,
                PricePerNight = request.PricePerNight,
                PropertyTypeId = request.PropertyTypeId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _propertyRepository.CreateAsync(property);

            if (request.AmenityIds.Any())
            {
                await _propertyRepository.AddAmenitiesToPropertyAsync(created.PropertyId, request.AmenityIds);
            }

            return await GetPropertyByIdAsync(created.PropertyId) ?? throw new Exception("Не удалось получить созданный объект");
        }
    }
}

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

        public async Task<(List<PropertySummaryResponse>, int)> SearchPropertiesAsync(SearchPropertiesRequest request)
        {
            var properties = await _propertyRepository.SearchAsync(
                request.City, request.CheckInDate, request.CheckOutDate,
                request.GuestsCount, request.MinPrice, request.MaxPrice,
                request.PropertyTypeId, request.BedroomsCount,
                request.Page, request.PageSize);

            var totalCount = await _propertyRepository.GetSearchCountAsync(
                request.City, request.CheckInDate, request.CheckOutDate,
                request.GuestsCount, request.MinPrice, request.MaxPrice,
                request.PropertyTypeId, request.BedroomsCount);

            var summaries = properties.Select(MapToSummary).ToList();
            return (summaries, totalCount);
        }

        public async Task<PropertyResponse> CreatePropertyAsync(int ownerId, CreatePropertyRequest request)
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

        public async Task<PropertyResponse?> UpdatePropertyAsync(int propertyId, int userId, UpdatePropertyRequest request)
        {
            if (!await _propertyRepository.IsOwnerAsync(propertyId, userId))
                return null;

            var property = await _propertyRepository.GetByIdAsync(propertyId);
            if (property == null) return null;

            // Обновляем только те поля, которые переданы
            if (!string.IsNullOrWhiteSpace(request.Title))
                property.Title = request.Title;

            if (request.Description != null)
                property.Description = request.Description;

            if (!string.IsNullOrWhiteSpace(request.Address))
                property.Address = request.Address;

            if (!string.IsNullOrWhiteSpace(request.City))
                property.City = request.City;

            if (request.GuestsCount.HasValue)
                property.GuestsCount = request.GuestsCount.Value;

            if (request.BedroomsCount.HasValue)
                property.BedroomsCount = request.BedroomsCount.Value;

            if (request.BedsCount.HasValue)
                property.BedsCount = request.BedsCount.Value;

            if (request.BathroomsCount.HasValue)
                property.BathroomsCount = request.BathroomsCount.Value;

            if (request.PricePerNight.HasValue)
                property.PricePerNight = request.PricePerNight.Value;

            if (request.PropertyTypeId.HasValue)
                property.PropertyTypeId = request.PropertyTypeId.Value;

            if (request.IsActive.HasValue)
                property.IsActive = request.IsActive.Value;

            await _propertyRepository.UpdateAsync(property);
            return await GetPropertyByIdAsync(propertyId);
        }

        public async Task<bool> DeletePropertyAsync(int propertyId, int userId)
        {
            if (!await _propertyRepository.IsOwnerAsync(propertyId, userId)) 
                return false;

            return await _propertyRepository.DeleteAsync(propertyId);
        }

        public async Task<List<PropertySummaryResponse>> GetMyPropertiesAsync(int ownerId)
        {
            var properties = await _propertyRepository.GetByOwnerIdAsync(ownerId);
            return properties.Select(MapToSummary).ToList();
        }

        public async Task<bool> IsOwnerAsync(int propertyId, int userId)
        {
            return await _propertyRepository.IsOwnerAsync(propertyId, userId);
        }

        private PropertyResponse MapToResponse(Property property)
        {
            // расчёт среднего рейтинга из отзывов
            double? averageRating = property.Reviews != null && property.Reviews.Any()
                ? property.Reviews.Average(r => r.Rating)
                : null;

            return new PropertyResponse
            {
                PropertyId = property.PropertyId,
                Title = property.Title,
                Description = property.Description,
                Address = property.Address,
                City = property.City,
                Latitude = property.Latitude,
                Longitude = property.Longitude,
                GuestsCount = property.GuestsCount,
                BedroomsCount = property.BedroomsCount,
                BedsCount = property.BedsCount,
                BathroomsCount = property.BathroomsCount,
                PricePerNight = property.PricePerNight,
                IsActive = property.IsActive,
                OwnerName = property.Owner != null
                    ? $"{property.Owner.FirstName} {property.Owner.LastName}"
                    : "Неизвестный",
                PropertyType = property.PropertyType?.TypeName ?? "Не указан",
                Amenities = property.PropertyAmenities?
                    .Select(pa => pa.Amenity?.AmenityName ?? string.Empty)
                    .Where(a => !string.IsNullOrEmpty(a))
                    .ToList() ?? new List<string>(),
                Photos = property.PropertyPhotos?
                    .OrderByDescending(p => p.IsMain)
                    .ThenBy(p => p.UploadedAt)
                    .Select(p => p.PhotoUrl)
                    .ToList() ?? new List<string>(),
                AverageRating = averageRating,
                ReviewsCount = property.Reviews?.Count ?? 0,
                CreatedAt = property.CreatedAt
            };
        }

        private PropertySummaryResponse MapToSummary(Property property)
        {
            // Находим главное фото (is_main = true) или берём первое
            var mainPhoto = property.PropertyPhotos?
                .FirstOrDefault(p => p.IsMain)?.PhotoUrl
                ?? property.PropertyPhotos?.FirstOrDefault()?.PhotoUrl
                ?? string.Empty;

            double? averageRating = property.Reviews != null && property.Reviews.Any()
                ? property.Reviews.Average(r => r.Rating)
                : null;

            return new PropertySummaryResponse
            {
                PropertyId = property.PropertyId,
                Title = property.Title,
                City = property.City,
                MainPhotoUrl = mainPhoto,
                PricePerNight = property.PricePerNight,
                AverageRating = averageRating,
                GuestsCount = property.GuestsCount,
                BedroomsCount = property.BedroomsCount
            };
        }
    }
}

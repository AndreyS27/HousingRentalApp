using HousingRentalApp.Api.Data;
using HousingRentalApp.Api.Data.Repositories;
using HousingRentalApp.Api.DTOs;
using HousingRentalApp.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace HousingRentalApp.Api.Services
{
    public class PropertyService : IPropertyService
    {
        private readonly IPropertyRepository _propertyRepository;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly ApplicationDbContext _context;

        public PropertyService(IPropertyRepository propertyRepository, IWebHostEnvironment webHostEnvironment, ApplicationDbContext context)
        {
            _propertyRepository = propertyRepository;
            _webHostEnvironment = webHostEnvironment;
            _context = context;
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
                request.PropertyTypeId, request.BedroomsCount, request.BedsCount, request.Amenities,
                request.Page, request.PageSize);

            var totalCount = await _propertyRepository.GetSearchCountAsync(
                request.City, request.CheckInDate, request.CheckOutDate,
                request.GuestsCount, request.MinPrice, request.MaxPrice,
                request.PropertyTypeId, request.BedroomsCount, request.BedsCount, request.Amenities);

            var summaries = properties.Select(MapToSummary).ToList();
            return (summaries, totalCount);
        }

        public async Task<PropertyResponse> CreatePropertyAsync(int ownerId, CreatePropertyRequest request)
        {
            // Автоматическое получение координат, если они не переданы
            decimal? latitude = request.Latitude;
            decimal? longitude = request.Longitude;

            if ((latitude == null || longitude == null) && !string.IsNullOrWhiteSpace(request.Address))
            {
                var fullAddress = $"{request.City}, {request.Address}";
                var coordinates = await GetCoordinatesFromAddressAsync(fullAddress);

                if (coordinates != null)
                {
                    latitude = coordinates.Value.Latitude;
                    longitude = coordinates.Value.Longitude;
                }
            }

            var property = new Property
            {
                OwnerId = ownerId,
                Title = request.Title,
                Description = request.Description,
                Address = request.Address,
                City = request.City,
                Latitude = latitude,
                Longitude = longitude,
                GuestsCount = request.GuestsCount,
                BedroomsCount = request.BedroomsCount,
                BedsCount = request.BedsCount,
                BathroomsCount = request.BathroomsCount,
                PricePerNight = request.PricePerNight,
                PropertyTypeId = request.PropertyTypeId,
                IsActive = true,
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

            // Обновляем основные поля
            if (!string.IsNullOrWhiteSpace(request.Title))
                property.Title = request.Title;

            if (request.Description != null)
                property.Description = request.Description;

            if (!string.IsNullOrWhiteSpace(request.Address))
                property.Address = request.Address;

            if (!string.IsNullOrWhiteSpace(request.City))
                property.City = request.City;

            // Обновляем координаты, если изменился адрес или город
            if (!string.IsNullOrWhiteSpace(request.Address) || !string.IsNullOrWhiteSpace(request.City))
            {
                var fullAddress = $"{request.City ?? property.City}, {request.Address ?? property.Address}";
                var coordinates = await GetCoordinatesFromAddressAsync(fullAddress);

                if (coordinates != null)
                {
                    property.Latitude = coordinates.Value.Latitude;
                    property.Longitude = coordinates.Value.Longitude;
                }
            }
            else if (request.Latitude.HasValue && request.Longitude.HasValue)
            {
                // Если координаты переданы явно
                property.Latitude = request.Latitude.Value;
                property.Longitude = request.Longitude.Value;
            }


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

            // Обновляем удобства
            if (request.AmenityIds != null)
            {
                // Удаляем старые связи
                var oldAmenities = _context.PropertyAmenities.Where(pa => pa.PropertyId == propertyId);
                _context.PropertyAmenities.RemoveRange(oldAmenities);

                // Добавляем новые
                foreach (var amenityId in request.AmenityIds)
                {
                    _context.PropertyAmenities.Add(new PropertyAmenity
                    {
                        PropertyId = propertyId,
                        AmenityId = amenityId
                    });
                }
            }

            // Обновляем переопределения дат (PropertyAvailability)
            if (request.DateOverrides != null)
            {
                // Удаляем старые переопределения для этого объекта
                var oldOverrides = _context.PropertyAvailabilities.Where(pa => pa.PropertyId == propertyId);
                _context.PropertyAvailabilities.RemoveRange(oldOverrides);

                // Добавляем новые
                foreach (var overrideDto in request.DateOverrides)
                {
                    _context.PropertyAvailabilities.Add(new PropertyAvailability
                    {
                        PropertyId = propertyId,
                        Date = overrideDto.Date,
                        IsAvailable = overrideDto.IsAvailable,
                        PriceOverride = overrideDto.PriceOverride
                    });
                }
            }

            // Удаляем фотографии
            if (request.PhotosToDeleteIds != null && request.PhotosToDeleteIds.Any())
            {
                var uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "uploads", "properties");

                foreach (var photoId in request.PhotosToDeleteIds)
                {
                    // Находим запись в БД
                    var photo = await _context.PropertyPhotos
                        .FirstOrDefaultAsync(p => p.PhotoId == photoId && p.PropertyId == propertyId);
                    if (photo != null)
                    {
                        var uri = new Uri(photo.PhotoUrl);
                        var fileName = Path.GetFileName(uri.LocalPath);
                        var filePath = Path.Combine(uploadsFolder, fileName);

                        if (File.Exists(filePath))
                        {
                            File.Delete(filePath);
                        }

                        // Удаляем запись из БД
                        _context.PropertyPhotos.Remove(photo);
                    }
                }
            }

            await _context.SaveChangesAsync();
            return await GetPropertyByIdAsync(propertyId);
        }

        public async Task<bool> DeletePropertyAsync(int propertyId, int userId)
        {
            if (!await _propertyRepository.IsOwnerAsync(propertyId, userId))
                return false;

            var property = await _propertyRepository.GetByIdAsync(propertyId);
            if (property == null)
                return false;

            // Удаление физических файлов фотографий с сервера

            if (property.PropertyPhotos != null && property.PropertyPhotos.Any())
            {
                var uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "uploads", "properties");

                foreach (var photo in property.PropertyPhotos)
                {
                    if (!string.IsNullOrEmpty(photo.PhotoUrl))
                    {
                        var uri = new Uri(photo.PhotoUrl);
                        var fileName = Path.GetFileName(uri.LocalPath);
                        var filePath = Path.Combine(uploadsFolder, fileName);

                        if (File.Exists(filePath))
                        {
                            File.Delete(filePath);
                        }
                    }
                }
            }

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

            var amenityIds = property.PropertyAmenities?
                .Select(pa => pa.AmenityId)
                .ToList() ?? new List<int>();

            var dateOverrides = property.PropertyAvailabilities?
                .Select(pa => new DateOverrideDto
                {
                    Date = pa.Date,
                    IsAvailable = pa.IsAvailable,
                    PriceOverride = pa.PriceOverride
                })
                .ToList() ?? new List<DateOverrideDto>();

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
                PropertyTypeId = property.PropertyTypeId,
                Amenities = property.PropertyAmenities?
                    .Select(pa => pa.Amenity?.AmenityName ?? string.Empty)
                    .Where(a => !string.IsNullOrEmpty(a))
                    .ToList() ?? new List<string>(),
                AmenityIds = amenityIds,
                Photos = property.PropertyPhotos?
                    .OrderByDescending(p => p.IsMain)
                    .ThenBy(p => p.UploadedAt)
                    .Select(p => new PropertyPhotoDto
                    {
                        PhotoId = p.PhotoId,
                        PhotoUrl = p.PhotoUrl,
                        IsMain = p.IsMain,
                        UploadedAt = p.UploadedAt
                    })
                    .ToList() ?? new List<PropertyPhotoDto>(),
                AverageRating = averageRating,
                ReviewsCount = property.Reviews?.Count ?? 0,
                CreatedAt = property.CreatedAt,
                DateOverrides = dateOverrides
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
                BedroomsCount = property.BedroomsCount,
                Latitude = property.Latitude,
                Longitude = property.Longitude,
                IsActive = property.IsActive
            };
        }

        /// <summary>
        /// Получение координат по адресу через внешний API
        /// </summary>
        private async Task<(decimal Latitude, decimal Longitude)?> GetCoordinatesFromAddressAsync(string address)
        {
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Add("User-Agent", "HousingRentalApp/1.0 (sampandrey@yandex.ru)");

            var url = $"https://nominatim.openstreetmap.org/search?q={Uri.EscapeDataString(address)}&format=json&limit=1";

            try
            {
                var response = await httpClient.GetAsync(url);
                var content = await response.Content.ReadAsStringAsync();

                using var doc = JsonDocument.Parse(content);
                if (doc.RootElement.GetArrayLength() == 0)
                    return null;

                var firstResult = doc.RootElement[0];
                var lat = decimal.Parse(firstResult.GetProperty("lat").GetString() ?? "0", System.Globalization.CultureInfo.InvariantCulture);
                var lon = decimal.Parse(firstResult.GetProperty("lon").GetString() ?? "0", System.Globalization.CultureInfo.InvariantCulture);

                return (lat, lon);
            }
            catch
            {
                return null;
            }
        }

    }
}

using HousingRentalApp.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HousingRentalApp.Api.Data.Repositories
{
    public class PropertyRepository : IPropertyRepository
    {
        private readonly ApplicationDbContext _context;

        public PropertyRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Property?> GetByIdAsync(int properyId)
        {
            return await _context.Properties
                .Include(p => p.Owner)
                .Include(p => p.PropertyType)
                .Include(p => p.PropertyAmenities)
                    .ThenInclude(pa => pa.Amenity)
                .Include(p => p.PropertyPhotos)
                .Include(p => p.Reviews)
                .Include(p => p.PropertyAvailabilities) // Для ручных блокировок
                .Include(p => p.Bookings)               // Для подтверждённых бронирований
                    .ThenInclude(b => b.Status)
                .Include(p => p.Views)
                .FirstOrDefaultAsync(p => p.PropertyId == properyId);
        }

        public async Task<Property> CreateAsync(Property property)
        {
            _context.Properties.Add(property);
            await _context.SaveChangesAsync();
            return property;
        }

        public async Task<Property> UpdateAsync(Property property)
        {
            _context.Properties.Update(property);
            await _context.SaveChangesAsync();
            return property;
        }

        public async Task<bool> DeleteAsync(int propertyId)
        {
            var property = await _context.Properties.FindAsync(propertyId);
            if (property == null) return false;

            _context.Properties.Remove(property);
            await _context.SaveChangesAsync();
            return true;
        }

        // Поиск с фильтрацией
        public async Task<List<Property>> SearchAsync(string? city, DateOnly? checkIn, DateOnly? checkOut,
            int? guestsCount, decimal? minPrice, decimal? maxPrice, int? propertyTypeId,
            int? bedroomsCount, int? bedsCount, List<string>? amenities,
            int page, int pageSize)
        {
            var query = _context.Properties
                .Include(p => p.PropertyType)
                .Include(p => p.PropertyPhotos)
                .Include(p => p.Reviews)
                .Include(p => p.PropertyAmenities)
                    .ThenInclude(pa => pa.Amenity)
                .Where(p => p.IsActive == true);

            if (!string.IsNullOrWhiteSpace(city))
            {
                query = query.Where(p => p.City.ToLower().Contains(city.ToLower()));
            }

            if (guestsCount.HasValue)
            {
                query = query.Where(p => p.GuestsCount >= guestsCount.Value);
            }

            if (minPrice.HasValue)
            {
                query = query.Where(p => p.PricePerNight >= minPrice.Value);
            }
            if (maxPrice.HasValue)
            {
                query = query.Where(p => p.PricePerNight <= maxPrice.Value);
            }

            if (propertyTypeId.HasValue)
            {
                query = query.Where(p => p.PropertyTypeId == propertyTypeId.Value);
            }

            if (bedroomsCount.HasValue)
            {
                query = query.Where(p => p.BedroomsCount >= bedroomsCount.Value);
            }

            if (bedsCount.HasValue)
            {
                query = query.Where(p => p.BedsCount >= bedsCount.Value);
            }

            // Фильтр по удобствам
            if (amenities != null && amenities.Any())
            {
                foreach (var amenity in amenities)
                {
                    query = query.Where(p => p.PropertyAmenities.Any(pa => pa.Amenity != null && pa.Amenity.AmenityName == amenity));
                }
            }

            // Проверка доступности объекта в выбранные даты
            if (checkIn.HasValue && checkOut.HasValue && checkOut > checkIn)
            {
                query = query.Where(p => !_context.Bookings.Any(b =>
                    b.PropertyId == p.PropertyId &&
                    b.StatusId == 2 &&
                    b.CheckInDate < checkOut.Value &&
                    b.CheckOutDate > checkIn.Value
                ));

                query = query.Where(p => !_context.PropertyAvailabilities.Any(pa =>
                    pa.PropertyId == p.PropertyId &&
                    pa.IsAvailable == false &&
                    pa.Date >= checkIn.Value &&
                    pa.Date < checkOut.Value
                ));
            }

            query = query.Skip((page - 1) * pageSize).Take(pageSize);

            return await query.ToListAsync();
        }

        public async Task<int> GetSearchCountAsync(string? city, DateOnly? checkIn, DateOnly? checkOut,
            int? guestsCount, decimal? minPrice, decimal? maxPrice, int? propertyTypeId,
            int? bedroomsCount, int? bedsCount, List<string>? amenities)
        {
            var query = _context.Properties
                .Include(p => p.PropertyAmenities)
                    .ThenInclude(pa => pa.Amenity)
                .Where(p => p.IsActive == true);

            if (!string.IsNullOrWhiteSpace(city))
                query = query.Where(p => p.City.ToLower().Contains(city.ToLower()));

            if (guestsCount.HasValue)
                query = query.Where(p => p.GuestsCount >= guestsCount.Value);

            if (minPrice.HasValue)
                query = query.Where(p => p.PricePerNight >= minPrice.Value);
            if (maxPrice.HasValue)
                query = query.Where(p => p.PricePerNight <= maxPrice.Value);

            if (propertyTypeId.HasValue)
                query = query.Where(p => p.PropertyTypeId == propertyTypeId.Value);

            if (bedroomsCount.HasValue)
                query = query.Where(p => p.BedroomsCount >= bedroomsCount.Value);

            // Фильтр по количеству кроватей
            if (bedsCount.HasValue)
            {
                query = query.Where(p => p.BedsCount >= bedsCount.Value);
            }

            // Фильтр по удобствам
            if (amenities != null && amenities.Any())
            {
                foreach (var amenity in amenities)
                {
                    query = query.Where(p => p.PropertyAmenities.Any(pa => pa.Amenity != null && pa.Amenity.AmenityName == amenity));
                }
            }

            if (checkIn.HasValue && checkOut.HasValue && checkOut > checkIn)
            {
                query = query.Where(p => !_context.Bookings.Any(b =>
                    b.PropertyId == p.PropertyId &&
                    b.StatusId == 2 &&
                    b.CheckInDate < checkOut.Value &&
                    b.CheckOutDate > checkIn.Value
                ));

                query = query.Where(p => !_context.PropertyAvailabilities.Any(pa =>
                    pa.PropertyId == p.PropertyId &&
                    pa.IsAvailable == false &&
                    pa.Date >= checkIn.Value &&
                    pa.Date < checkOut.Value
                ));
            }

            return await query.CountAsync();
        }

        public async Task<List<Property>> GetByOwnerIdAsync(int ownerId)
        {
            return await _context.Properties
                .Include(p => p.PropertyType)
                .Include(p => p.PropertyPhotos)
                .Where(p => p.OwnerId == ownerId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> IsOwnerAsync(int propertyId, int userId)
        {
            return await _context.Properties
                .AnyAsync(p => p.PropertyId == propertyId && p.OwnerId == userId);
        }

        public async Task AddAmenitiesToPropertyAsync(int propertyId, List<int> amenityIds)
        {
            var propertyAmenities = amenityIds.Select(amenityId => new PropertyAmenity
            {
                PropertyId = propertyId,
                AmenityId = amenityId
            }).ToList();

            _context.PropertyAmenities.AddRange(propertyAmenities);
            await _context.SaveChangesAsync();
        }

        public async Task RemoveAllAmenitiesAsync(int propertyId)
        {
            var amenities = _context.PropertyAmenities.Where(pa => pa.PropertyId == propertyId);
            _context.PropertyAmenities.RemoveRange(amenities);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(int properyId)
        {
            return await _context.Properties.AnyAsync(p => p.PropertyId == properyId);
        }
    }
}

using HousingRentalApp.Api.DTOs;
using HousingRentalApp.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HousingRentalApp.Api.Data.Repositories
{
    public class PropertyViewRepository : IPropertyViewRepository
    {
        private readonly ApplicationDbContext _context;

        public PropertyViewRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddViewAsync(int propertyId, int? userId, string? ipAddress)
        {
            var view = new PropertyView
            {
                PropertyId = propertyId,
                UserId = userId,
                IpAddress = ipAddress,
                ViewDate = DateTime.UtcNow
            };

            _context.PropertyViews.Add(view);
            await _context.SaveChangesAsync();
        }

        public async Task<int> GetViewCountAsync(int propertyId)
        {
            return await _context.PropertyViews
                .CountAsync(v => v.PropertyId == propertyId);
        }

        public async Task<int> GetViewCountForPeriodAsync(int propertyId, DateTime startDate)
        {
            return await _context.PropertyViews
                .CountAsync(v => v.PropertyId == propertyId && v.ViewDate >= startDate);
        }

        public async Task<List<DailyViewsDto>> GetDailyViewsAsync(int propertyId, int days)
        {
            var startDate = DateTime.UtcNow.AddDays(-days);

            var rawViews = await _context.PropertyViews
                .Where(v => v.PropertyId == propertyId && v.ViewDate >= startDate)
                .Select(v => new { v.ViewDate })
                .ToListAsync(); // Сначала получаем данные в память

            // Группировка и форматирование выполняется на клиенте
            var views = rawViews
                .GroupBy(v => v.ViewDate.Date)
                .Select(g => new DailyViewsDto
                {
                    Date = g.Key.ToString("yyyy-MM-dd"),
                    Count = g.Count()
                })
                .OrderBy(d => d.Date)
                .ToList();

            return views;
        }
    }
}

using HousingRentalApp.Api.Data;
using HousingRentalApp.Api.Data.Repositories;
using HousingRentalApp.Api.DTOs;
using HousingRentalApp.Api.Models;
using HousingRentalApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HousingRentalApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PropertiesController : ControllerBase
    {
        private readonly IPropertyService _propertyService;
        private readonly ApplicationDbContext _context;
        private readonly IPropertyViewRepository _propertyViewRepository;
        private readonly IS3Service _s3Service;

        public PropertiesController(
            IPropertyService propertyService,  
            ApplicationDbContext context,
            IPropertyViewRepository propertyViewRepository,
            IS3Service s3Service)
        {
            _propertyService = propertyService;
            _context = context;
            _propertyViewRepository = propertyViewRepository;
            _s3Service = s3Service;
        }

        /// <summary>
        /// Поиск объектов с фильтрацией
        /// GET /api/properties/search?city=Москва&guestsCount=2&page=1
        /// </summary>
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] SearchPropertiesRequest request)
        {
            var (properties, totalCount) = await _propertyService.SearchPropertiesAsync(request);

            return Ok(new
            {
                properties = properties, 
                totalCount = totalCount,
                currentPage = request.Page,
                pageSize = request.PageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize)
            });
        }

        /// <summary>
        /// Получение детальной информации об объекте
        /// GET /api/properties/{id}
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var userId = User.Identity?.IsAuthenticated == true ? GetCurrentUserId() : (int?)null;
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

            var property = await _propertyService.GetPropertyByIdAsync(id, userId, ipAddress);
            if (property == null)
                return NotFound(new { message = "Объект не найден" });

            return Ok(property);
        }

        /// <summary>
        /// Получить все объекты текущего пользователя (только для арендодателей)
        /// GET /api/properties/my
        /// </summary>
        [Authorize]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyProperties()
        {
            var userId = GetCurrentUserId();
            var properties = await _propertyService.GetMyPropertiesAsync(userId);
            return Ok(properties);
        }

        /// <summary>
        /// Создание нового объекта
        /// POST /api/properties
        /// </summary>
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromForm] CreatePropertyRequest request, IFormFileCollection photos)
        {
            var userId = GetCurrentUserId();

            // Базовая валидация
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (photos.Count > 9)
                return BadRequest(new { message = "Можно загрузить не более 9 фотографий" });

            // Валидация типов файлов
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            foreach (var photo in photos)
            {
                var extension = Path.GetExtension(photo.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(extension))
                    return BadRequest(new { message = $"Недопустимый формат файла: {photo.FileName}. Разрешены: jpg, jpeg, png, webp" });
            }

            try
            {
                var created = await _propertyService.CreatePropertyAsync(userId, request);

                // сохранение фотографий

                var s3Service = HttpContext.RequestServices.GetRequiredService<IS3Service>();

                for (int i = 0; i < photos.Count; i++)
                {
                    var photoUrl = await s3Service.UploadPropertyPhotoAsync(photos[i]);

                    var propertyPhoto = new PropertyPhoto
                    {
                        PropertyId = created.PropertyId,
                        PhotoUrl = photoUrl,
                        IsMain = i == 0, // Первая фотография — главная
                    };

                    _context.PropertyPhotos.Add(propertyPhoto);
                }

                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetById), new { id = created.PropertyId }, created);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ошибка при создании объекта", error = ex.Message });
            }
        }

        /// <summary>
        /// Обновление объекта (только для владельца)
        /// PUT /api/properties/{id}
        /// </summary>
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdatePropertyRequest request)
        {
            var userId = GetCurrentUserId();

            var property = await _propertyService.GetPropertyByIdAsync(id);
            if (property == null)
                return NotFound(new { message = "Объект не найден" });

            var isOwner = await _propertyService.IsOwnerAsync(id, userId);
            if (!isOwner)
                return Forbid("Вы не являетесь владельцем этого объекта");

            var updated = await _propertyService.UpdatePropertyAsync(id, userId, request);
            return Ok(updated);
        }

        /// <summary>
        /// Удаление объекта (только для владельца)
        /// DELETE /api/properties/{id}
        /// </summary>
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = GetCurrentUserId();

            var property = await _propertyService.GetPropertyByIdAsync(id);
            if (property == null)
                return NotFound(new { message = "Объект не найден" });

            var isOwner = await _propertyService.IsOwnerAsync(id, userId);
            if (!isOwner)
                return Forbid("Вы не являетесь владельцем этого объекта");

            var result = await _propertyService.DeletePropertyAsync(id, userId);
            if (result)
                return Ok(new { message = "Объект успешно удалён" });

            return StatusCode(500, new { message = "Ошибка при удалении объекта" });
        }

        /// <summary>
        /// Добавление фотографий к существующему объекту
        /// POST /api/properties/{id}/photos
        /// </summary>
        [Authorize]
        [HttpPost("{id}/photos")]
        public async Task<IActionResult> AddPhotos(int id, IFormFileCollection photos)
        {
            var userId = GetCurrentUserId();

            var isOwner = await _propertyService.IsOwnerAsync(id, userId);
            if (!isOwner)
                return Forbid("Вы не являетесь владельцем этого объекта");

            var property = await _propertyService.GetPropertyByIdAsync(id);
            if (property == null)
                return NotFound(new { message = "Объект не найден" });

            var currentPhotoCount = _context.PropertyPhotos.Count(p => p.PropertyId == id);
            var remainingSlots = 9 - currentPhotoCount;

            if (photos.Count > remainingSlots)
                return BadRequest(new { message = $"Можно добавить не более {remainingSlots} фотографий" });

            var newPhotos = new List<PropertyPhoto>();

            for (int i = 0; i < photos.Count; i++)
            {
                var photo = photos[i];
                var photoUrl = await _s3Service.UploadPropertyPhotoAsync(photo);

                var isMain = currentPhotoCount == 0 && i == 0; // Если нет ни одной фотографии, первая становится главной

                var propertyPhoto = new PropertyPhoto
                {
                    PropertyId = id,
                    PhotoUrl = photoUrl,
                    IsMain = isMain,
                };

                newPhotos.Add(propertyPhoto);
            }

            _context.PropertyPhotos.AddRange(newPhotos);
            await _context.SaveChangesAsync();

            return Ok(newPhotos.Select(p => new { p.PhotoId, p.PhotoUrl, p.IsMain }));
        }

        /// <summary>
        /// Установка главной фотографии
        /// PUT /api/properties/{id}/photos/{photoId}/main
        /// </summary>
        [Authorize]
        [HttpPut("{id}/photos/{photoId}/main")]
        public async Task<IActionResult> SetMainPhoto(int id, int photoId)
        {
            var userId = GetCurrentUserId();

            var isOwner = await _propertyService.IsOwnerAsync(id, userId);
            if (!isOwner)
                return Forbid("Вы не являетесь владельцем этого объекта");

            // Сбрасываем флаг IsMain для всех фотографий объекта
            var photos = await _context.PropertyPhotos.Where(p => p.PropertyId == id).ToListAsync();
            foreach (var photo in photos)
            {
                photo.IsMain = false;
            }

            // Устанавливаем IsMain для выбранной фотографии
            var mainPhoto = photos.FirstOrDefault(p => p.PhotoId == photoId);
            if (mainPhoto == null)
                return NotFound(new { message = "Фотография не найдена" });

            mainPhoto.IsMain = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Главная фотография обновлена" });
        }

        /// <summary>
        /// Получить статистику просмотров объекта
        /// GET /api/properties/{id}/views
        /// </summary>
        [Authorize]
        [HttpGet("{id}/views")]
        public async Task<IActionResult> GetPropertyViews(int id)
        {
            var userId = GetCurrentUserId();

            var isOwner = await _propertyService.IsOwnerAsync(id, userId);
            if (!isOwner)
                return Forbid("Вы не являетесь владельцем этого объекта");

            var totalViews = await _propertyViewRepository.GetViewCountAsync(id);
            var viewsLastWeek = await _propertyViewRepository.GetViewCountForPeriodAsync(id, DateTime.UtcNow.AddDays(-7));
            var viewsLastMonth = await _propertyViewRepository.GetViewCountForPeriodAsync(id, DateTime.UtcNow.AddDays(-30));
            var dailyViews = await _propertyViewRepository.GetDailyViewsAsync(id, 30);

            return Ok(new PropertyViewResponse
            {
                PropertyId = id,
                TotalViews = totalViews,
                ViewsLastWeek = viewsLastWeek,
                ViewsLastMonth = viewsLastMonth,
                DailyViews = dailyViews
            });
        }

        /// <summary>
        /// Вспомогательный метод для получения ID текущего пользователя из JWT-токена
        /// </summary>
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                throw new UnauthorizedAccessException("Не удалось определить пользователя");

            return int.Parse(userIdClaim);
        }
    }
}

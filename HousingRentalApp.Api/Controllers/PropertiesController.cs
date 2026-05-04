using HousingRentalApp.Api.DTOs;
using HousingRentalApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Metadata;
using System.Security.Claims;

namespace HousingRentalApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PropertiesController : ControllerBase
    {
        private readonly IPropertyService _propertyService;

        public PropertiesController(IPropertyService propertyService)
        {
            _propertyService = propertyService;
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
            var property = await _propertyService.GetPropertyByIdAsync(id);
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
        public async Task<IActionResult> Create([FromBody] CreatePropertyRequest request)
        {
            var userId = GetCurrentUserId();

            // Базовая валидация
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var created = await _propertyService.CreatePropertyAsync(userId, request);
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

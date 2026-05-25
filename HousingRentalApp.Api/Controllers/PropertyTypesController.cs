using HousingRentalApp.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HousingRentalApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PropertyTypesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PropertyTypesController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Получить список всех типов объектов
        /// GET /api/propertytypes
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var propertyTypes = await _context.PropertyTypes
                .OrderBy(pt => pt.PropertyTypeId)
                .Select(pt => new { pt.PropertyTypeId, pt.TypeName })
                .ToListAsync();

            return Ok(propertyTypes);
        }
    }
}

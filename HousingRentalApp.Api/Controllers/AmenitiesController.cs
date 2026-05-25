using HousingRentalApp.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HousingRentalApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AmenitiesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AmenitiesController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Получить список всех удобств
        /// GET /api/amenities
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var amenities = await _context.Amenities
                .OrderBy(a => a.AmenityId)
                .Select(a => new { a.AmenityId, a.AmenityName })
                .ToListAsync();

            return Ok(amenities);
        }
    }
}

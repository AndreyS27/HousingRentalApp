using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace HousingRentalApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GeocodeController : ControllerBase
    {
        [HttpGet("city")]
        public async Task<IActionResult> GeocodeCity([FromQuery] string city)
        {
            if (string.IsNullOrWhiteSpace(city))
                return BadRequest(new { error = "City parameter is required" });

            using var client = new HttpClient();

            // Добавляем User-Agent (требование Nominatim)
            client.DefaultRequestHeaders.Add("User-Agent", "HousingRentalApp/1.0 (sampandrey@yandex.ru)");

            var url = $"https://nominatim.openstreetmap.org/search?q={Uri.EscapeDataString(city)}&format=json&limit=1";

            var response = await client.GetAsync(url);
            var content = await response.Content.ReadAsStringAsync();

            // Парсим ответ, чтобы вернуть только нужные поля
            using var doc = JsonDocument.Parse(content);
            if (doc.RootElement.GetArrayLength() == 0)
                return NotFound(new { error = "City not found" });

            var firstResult = doc.RootElement[0];
            var result = new
            {
                lat = firstResult.GetProperty("lat").GetString(),
                lon = firstResult.GetProperty("lon").GetString(),
                displayName = firstResult.GetProperty("display_name").GetString()
            };

            return Ok(result);
        }

        [HttpGet("address")]
        public async Task<IActionResult> GeocodeAddress([FromQuery] string address)
        {
            if (string.IsNullOrWhiteSpace(address))
                return BadRequest(new { error = "Address parameter is required" });

            using var client = new HttpClient();

            client.DefaultRequestHeaders.Add("User-Agent", "HousingRentalApp/1.0 (sampandrey@yandex.ru)");

            var url = $"https://nominatim.openstreetmap.org/search?q={Uri.EscapeDataString(address)}&format=json&limit=1";

            var response = await client.GetAsync(url);
            var content = await response.Content.ReadAsStringAsync();

            using var doc = JsonDocument.Parse(content);
            if (doc.RootElement.GetArrayLength() == 0)
                return NotFound(new { error = "Адрес не найден" });

            var firstResult = doc.RootElement[0];
            var result = new
            {
                lat = firstResult.GetProperty("lat").GetString(),
                lon = firstResult.GetProperty("lon").GetString(),
                displayName = firstResult.GetProperty("display_name").GetString()
            };

            return Ok(result);
        }
    }
}
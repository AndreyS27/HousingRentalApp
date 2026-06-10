using HousingRentalApp.Api.DTOs;
using HousingRentalApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HousingRentalApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        /// <summary>
        /// Регистрация нового пользователя
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            // Простая валидация, позже изменить
            if (string.IsNullOrWhiteSpace(request.Email))
                return BadRequest(new { message = "Email обязателен" });

            if (string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { message = "Пароль обязателен" });

            if (request.Password.Length < 6)
                return BadRequest(new { message = "Пароль должен быть не менее 6 символов" });

            var result = await _authService.RegisterAsync(request);

            if (!result.Success)
                return BadRequest(new {message = result.Message});

            return Ok(new
            {
                message = result.Message,
                token = result.Token,
                user = new
                {
                    email = result.Email,
                    firstName = result.FirstName,
                    lastName = result.LastName
                }
            });
        }

        /// <summary>
        /// Вход в систему
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // Простая валидация
            if (string.IsNullOrWhiteSpace(request.Email))
                return BadRequest(new { message = "Email обязателен" });

            if (string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { message = "Пароль обязателен" });

            if (request.Password.Length < 6)
                return BadRequest(new { message = "Пароль должен быть не менее 6 символов" });

            var result = await _authService.LoginAsync(request);

            if (!result.Success)
                return Unauthorized(new { message = result.Message });

            return Ok(new
            {
                message = result.Message,
                token = result.Token,
                user = new
                {
                    email = result.Email,
                    firstName = result.FirstName,
                    lastName = result.LastName,
                }
            });
        }

        /// <summary>
        /// Пример защищённого эндпоинта для теста
        /// </summary>
        [Authorize]
        [HttpGet("me")]
        public IActionResult GetCurrentUser()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

            return Ok(new
            {
                userId = userId,
                email = email,
                message = "Мой профиль"
            });
        }
    }
}

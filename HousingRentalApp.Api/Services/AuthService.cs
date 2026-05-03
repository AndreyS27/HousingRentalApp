using HousingRentalApp.Api.Data.Repositories;
using HousingRentalApp.Api.DTOs;
using HousingRentalApp.Api.Models;
using Microsoft.IdentityModel.Tokens;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HousingRentalApp.Api.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;

        public AuthService(IUserRepository userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            if (await _userRepository.EmailExistsAsync(request.Email))
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Пользователь с таким email уже существует"
                };
            }

            var passwordHash = HashPassword(request.Password);

            var user = new User
            {
                Email = request.Email,
                PasswordHash = passwordHash,
                FirstName = request.FirstName,
                LastName = request.LastName,
            };

            await _userRepository.CreateAsync(user);

            var token = GenerateJwtToken(user);

            return new AuthResponse
            {
                Success = true,
                Message = "Регистрация успешна",
                Token = token,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName
            };
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            // Ищем пользователя по email
            var user = await _userRepository.GetByEmailAsync(request.Email);
            if (user == null)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Неверный email или пароль"
                };
            }

            if (!VerifyPassword(request.Password, user.PasswordHash))
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Неверный email или пароль"
                };
            }

            var token = GenerateJwtToken(user);

            return new AuthResponse
            {
                Success = true,
                Message = "Вход выполнен успешно",
                Token = token,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
            };
        }

        public string HashPassword(string password)
        {
            // BCrypt генерирует соль автоматически
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        public bool VerifyPassword(string password, string hash)
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }

        private string GenerateJwtToken(User user)
        {
            var secret = _configuration["JwtSettings:Secret"];
            var issuer = _configuration["JwtSettings:Issuer"];
            var audience = _configuration["JwtSettings:Audience"];
            var expirationHours = int.Parse(_configuration["JwtSettings:ExpirationHours"]);


            var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secret));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.GivenName, user.FirstName),
                new Claim(ClaimTypes.Surname, user.LastName)
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(expirationHours),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}

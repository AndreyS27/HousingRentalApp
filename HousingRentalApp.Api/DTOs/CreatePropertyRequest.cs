using System.ComponentModel.DataAnnotations;

namespace HousingRentalApp.Api.DTOs
{
    public class CreatePropertyRequest
    {
        [Required(ErrorMessage = "Название обязательно")]
        [StringLength(255, MinimumLength = 3, ErrorMessage = "Название должно быть от 3 до 255 символов")]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required(ErrorMessage = "Адрес обязателен")]
        public string Address { get; set; } = string.Empty;

        [Required(ErrorMessage = "Город обязателен")]
        public string City { get; set; } = string.Empty;

        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }

        [Required(ErrorMessage = "Количество гостей обязательно")]
        [Range(1, 50, ErrorMessage = "Количество гостей должно быть от 1 до 50")]
        public int GuestsCount { get; set; }

        [Range(0, 20, ErrorMessage = "Количество спален должно быть от 0 до 20")]
        public int BedroomsCount { get; set; }

        [Range(0, 30, ErrorMessage = "Количество кроватей должно быть от 0 до 30")]
        public int BedsCount { get; set; }

        [Range(0, 10, ErrorMessage = "Количество ванных должно быть от 0 до 10")]
        public int BathroomsCount { get; set; }

        [Required(ErrorMessage = "Цена за ночь обязательна")]
        [Range(1, 1000000, ErrorMessage = "Цена должна быть от 1 до 1 000 000")]
        public decimal PricePerNight { get; set; }

        public int PropertyTypeId { get; set; }
        public List<int> AmenityIds { get; set; } = new List<int>();
    }
}

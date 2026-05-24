using HousingRentalApp.Api.DTOs;
using HousingRentalApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HousingRentalApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewsController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        /// <summary>
        /// Получить все отзывы текущего пользователя (как автора)
        /// GET /api/reviews/my
        /// </summary>
        [HttpGet("my")]
        public async Task<IActionResult> GetMyReviews()
        {
            var userId = GetCurrentUserId();
            var reviews = await _reviewService.GetMyReviewsAsync(userId);
            return Ok(reviews);
        }

        /// <summary>
        /// Получить все отзывы на объекты текущего пользователя (как владельца)
        /// GET /api/reviews/owner
        /// </summary>
        [HttpGet("owner")]
        public async Task<IActionResult> GetOwnerReviews()
        {
            var userId = GetCurrentUserId();
            var reviews = await _reviewService.GetReviewsForOwnerAsync(userId);
            return Ok(reviews);
        }

        /// <summary>
        /// Создать новый отзыв
        /// POST /api/reviews
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewRequest request)
        {
            var userId = GetCurrentUserId();

            if (request.Rating < 1 || request.Rating > 5)
                return BadRequest(new { message = "Оценка должна быть от 1 до 5" });

            try
            {
                var review = await _reviewService.CreateReviewAsync(userId, request);
                return Ok(new { message = "Отзыв успешно создан", review });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Обновить отзыв
        /// PUT /api/reviews/{id}
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReview(int id, [FromBody] UpdateReviewRequest request)
        {
            var userId = GetCurrentUserId();

            if (request.Rating < 1 || request.Rating > 5)
                return BadRequest(new { message = "Оценка должна быть от 1 до 5" });

            try
            {
                var review = await _reviewService.UpdateReviewAsync(userId, id, request);
                if (review == null)
                    return NotFound(new { message = "Отзыв не найден" });

                return Ok(new { message = "Отзыв успешно обновлён", review });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Удалить отзыв
        /// DELETE /api/reviews/{id}
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var userId = GetCurrentUserId();

            try
            {
                var result = await _reviewService.DeleteReviewAsync(userId, id);
                if (!result)
                    return NotFound(new { message = "Отзыв не найден" });

                return Ok(new { message = "Отзыв успешно удалён" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Проверить, можно ли оставить отзыв на бронирование
        /// GET /api/reviews/can-review/{bookingId}
        /// </summary>
        [HttpGet("can-review/{bookingId}")]
        public async Task<IActionResult> CanReview(int bookingId)
        {
            var userId = GetCurrentUserId();
            var canReview = await _reviewService.CanReviewAsync(userId, bookingId);
            return Ok(new { canReview });
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                throw new UnauthorizedAccessException("Не удалось определить пользователя");

            return int.Parse(userIdClaim);
        }
    }
}

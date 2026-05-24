using HousingRentalApp.Api.DTOs;
using HousingRentalApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HousingRentalApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingsController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        /// <summary>
        /// Получить все бронирования текущего пользователя (как арендатора)
        /// GET /api/bookings/my
        /// </summary>
        [HttpGet("my")]
        public async Task<IActionResult> GetMyBookings()
        {
            var userId = GetCurrentUserId();
            var bookings = await _bookingService.GetMyBookingsAsync(userId);
            return Ok(bookings);
        }

        /// <summary>
        /// Получить все бронирования объектов текущего пользователя (как арендодателя)
        /// GET /api/bookings/owner
        /// </summary>
        [HttpGet("owner")]
        public async Task<IActionResult> GetOwnerBookings()
        {
            var userId = GetCurrentUserId();
            var bookings = await _bookingService.GetBookingsForMyPropertiesAsync(userId);
            return Ok(bookings);
        }

        /// <summary>
        /// Получить детали конкретного бронирования
        /// GET /api/bookings/{id}
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBookingDetails(int id)
        {
            var userId = GetCurrentUserId();
            var booking = await _bookingService.GetBookingDetailsAsync(id, userId);

            if (booking == null)
                return NotFound(new { message = "Бронирование не найдено" });

            return Ok(booking);
        }

        /// <summary>
        /// Создать новое бронирование
        /// POST /api/bookings
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingRequest request)
        {
            var userId = GetCurrentUserId();

            try
            {
                var booking = await _bookingService.CreateBookingAsync(userId, request);

                // После создания бронирования возвращаем его данные
                // Оплата будет производиться отдельным запросом
                return Ok(new
                {
                    message = "Бронирование создано. Требуется оплата.",
                    bookingId = booking?.BookingId,
                    totalPrice = booking?.TotalPrice,
                    status = "pending_payment"
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Оплатить бронирование (имитация платежа)
        /// POST /api/bookings/{id}/pay
        /// </summary>
        //[HttpPost("{id}/pay")]
        //public async Task<IActionResult> PayForBooking()
        //{

        //}

        /// <summary>
        /// Отменить бронирование (до подтверждения арендодателем)
        /// DELETE /api/bookings/{id}
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelBooking(int id)
        {
            var userId = GetCurrentUserId();

            try
            {
                var result = await _bookingService.CancelBookingAsync(id, userId);
                if (result)
                {
                    return Ok(new { message = "Бронирование успешно отменено" });
                }
                return BadRequest(new { message = "Не удалось отменить бронирование" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Подтвердить бронирование (арендодатель)
        /// POST /api/bookings/{id}/confirm
        /// </summary>
        [HttpPost("{id}/confirm")]
        public async Task<IActionResult> ConfirmBooking(int id)
        {
            var userId = GetCurrentUserId();

            try
            {
                var result = await _bookingService.ConfirmBookingAsync(id, userId);
                if (result)
                {
                    return Ok(new { message = "Бронирование подтверждено" });
                }
                return BadRequest(new { message = "Не удалось подтвердить бронирование" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Отклонить бронирование (арендодатель)
        /// POST /api/bookings/{id}/reject
        /// </summary>
        [HttpPost("{id}/reject")]
        public async Task<IActionResult> RejectBooking(int id)
        {
            var userId = GetCurrentUserId();

            try
            {
                var result = await _bookingService.RejectBookingAsync(id, userId);
                if (result)
                {
                    return Ok(new { message = "Бронирование отклонено" });
                }
                return BadRequest(new { message = "Не удалось отклонить бронирование" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Проверить, можно ли оставить отзыв на бронирование
        /// GET /api/bookings/{id}/can-review
        /// </summary>
        [HttpGet("{id}/can-review")]
        public async Task<IActionResult> CanLeaveReview(int id)
        {
            var userId = GetCurrentUserId();
            var canReview = await _bookingService.CanLeaveReviewAsync(id, userId);
            return Ok(new { canReview = canReview });
        }

        /// <summary>
        /// Получить историю бронирований текущего пользователя (завершённые)
        /// GET /api/bookings/my/past
        /// </summary>
        [HttpGet("my/past")]
        public async Task<IActionResult> GetMyPastBookings()
        {
            var userId = GetCurrentUserId();
            var bookings = await _bookingService.GetMyPastBookingsAsync(userId);
            return Ok(bookings);
        }

        /// <summary>
        /// Получить заявки на бронирование объектов текущего пользователя (арендодатель)
        /// GET /api/bookings/owner/requests
        /// </summary>
        [HttpGet("owner/requests")]
        public async Task<IActionResult> GetBookingRequestsForOwner()
        {
            var userId = GetCurrentUserId();
            var bookings = await _bookingService.GetBookingRequestsForOwnerAsync(userId);
            return Ok(bookings);
        }

        /// <summary>
        /// Получить историю бронирований объектов текущего пользователя (арендодатель)
        /// GET /api/bookings/owner/past
        /// </summary>
        [HttpGet("owner/past")]
        public async Task<IActionResult> GetPastBookingsForOwner()
        {
            var userId = GetCurrentUserId();
            var bookings = await _bookingService.GetPastBookingsForOwnerAsync(userId);
            return Ok(bookings);
        }

        /// <summary>
        /// Получить отзывы на объекты текущего пользователя (арендодатель)
        /// GET /api/bookings/owner/reviews
        /// </summary>
        [HttpGet("owner/reviews")]
        public async Task<IActionResult> GetReviewsForOwner()
        {
            var userId = GetCurrentUserId();
            var reviews = await _bookingService.GetReviewsForOwnerAsync(userId);
            return Ok(reviews);
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

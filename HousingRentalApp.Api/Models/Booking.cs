using System;
using System.Collections.Generic;

namespace HousingRentalApp.Api.Models;

public partial class Booking
{
    public int BookingId { get; set; }

    public int PropertyId { get; set; }

    public int RenterId { get; set; }

    public int StatusId { get; set; }

    public DateOnly CheckInDate { get; set; }

    public DateOnly CheckOutDate { get; set; }

    public int GuestsCount { get; set; }

    public decimal TotalPrice { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual Property Property { get; set; } = null!;

    public virtual User Renter { get; set; } = null!;

    public virtual Review? Review { get; set; }

    public virtual BookingStatus Status { get; set; } = null!;
}

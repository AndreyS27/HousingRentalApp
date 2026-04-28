using System;
using System.Collections.Generic;

namespace HousingRentalApp.Api.Models;

public partial class Review
{
    public int ReviewId { get; set; }

    public int BookingId { get; set; }

    public int PropertyId { get; set; }

    public int ReviewerId { get; set; }

    public int Rating { get; set; }

    public string? Comment { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Booking Booking { get; set; } = null!;

    public virtual Property Property { get; set; } = null!;

    public virtual User Reviewer { get; set; } = null!;
}

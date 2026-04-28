using System;
using System.Collections.Generic;

namespace HousingRentalApp.Api.Models;

public partial class PropertyAvailability
{
    public int AvailabilityId { get; set; }

    public int PropertyId { get; set; }

    public DateOnly Date { get; set; }

    public bool? IsAvailable { get; set; }

    public decimal? PriceOverride { get; set; }

    public virtual Property Property { get; set; } = null!;
}

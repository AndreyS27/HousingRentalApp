using System;
using System.Collections.Generic;

namespace HousingRentalApp.Api.Models;

public partial class PropertyPhoto
{
    public int PhotoId { get; set; }

    public int PropertyId { get; set; }

    public string PhotoUrl { get; set; } = null!;

    public bool? IsMain { get; set; }

    public DateTime? UploadedAt { get; set; }

    public virtual Property Property { get; set; } = null!;
}

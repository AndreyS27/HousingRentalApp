using System;
using System.Collections.Generic;

namespace HousingRentalApp.Api.Models;

public partial class Property
{
    public int PropertyId { get; set; }

    public int OwnerId { get; set; }

    public int PropertyTypeId { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public string Address { get; set; } = null!;

    public string City { get; set; } = null!;

    public decimal? Latitude { get; set; }

    public decimal? Longitude { get; set; }

    public int GuestsCount { get; set; }

    public int BedroomsCount { get; set; }

    public int BedsCount { get; set; }

    public int BathroomsCount { get; set; }

    public decimal PricePerNight { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    public virtual User Owner { get; set; } = null!;

    public virtual ICollection<PropertyAmenity> PropertyAmenities { get; set; } = new List<PropertyAmenity>();

    public virtual ICollection<PropertyAvailability> PropertyAvailabilities { get; set; } = new List<PropertyAvailability>();

    public virtual ICollection<PropertyPhoto> PropertyPhotos { get; set; } = new List<PropertyPhoto>();

    public virtual PropertyType PropertyType { get; set; } = null!;

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
}

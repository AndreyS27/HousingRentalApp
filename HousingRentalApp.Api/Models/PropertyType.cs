using System;
using System.Collections.Generic;

namespace HousingRentalApp.Api.Models;

public partial class PropertyType
{
    public int PropertyTypeId { get; set; }

    public string TypeName { get; set; } = null!;

    public virtual ICollection<Property> Properties { get; set; } = new List<Property>();
}

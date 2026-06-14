
namespace HousingRentalApp.Api.Models
{
    public partial class PropertyView
    {
        public int ViewId { get; set; }
        public int PropertyId { get; set; }
        public int? UserId { get; set; }
        public DateTime ViewDate { get; set; }
        public string? IpAddress { get; set; }

        public virtual Property Property { get; set; } = null!;
        public virtual User? User { get; set; }
    }
}
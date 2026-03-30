using System.Text.Json.Serialization;

namespace ITServiceDesk.Api.Models
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public int LoaiTicketId { get; set; }
        public string Type { get; set; } = "";

        [JsonIgnore]
        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    }
}

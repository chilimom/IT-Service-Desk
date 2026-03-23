namespace ITServiceDesk.Api.Models;

using System.Text.Json.Serialization;

{
    public class Category
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Type { get; set; }
    [JsonIgnore]   // 👈 THÊM DÒNG NÀY
    public ICollection<Ticket> Tickets { get; set; }
}
}
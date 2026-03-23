namespace ITServiceDesk.Api.Models
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }

        public ICollection<Ticket> Tickets { get; set; }
    }
}
namespace ITServiceDesk.Api.Models
{
    public class TicketLog
    {
        public int Id { get; set; }
        public int TicketId { get; set; }
        public string Action { get; set; } = "";
        public string? Note { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }

    }
}
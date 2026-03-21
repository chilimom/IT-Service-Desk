namespace ITServiceDesk.Api.DTOs
{
    public class CreateTicketDto
    {
        public string Type { get; set; } = "";
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? EquipmentCode { get; set; }
        public string? Area { get; set; }
        public int? RequestedBy { get; set; }
        public string? AssignedTeam { get; set; }
        public DateTime? DueDate { get; set; }
    }
}

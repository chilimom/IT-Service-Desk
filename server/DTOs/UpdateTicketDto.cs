namespace ITServiceDesk.Api.DTOs
{
    public class UpdateTicketDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Factory { get; set; }
        public string? EquipmentCode { get; set; }
        public string? Area { get; set; }
        public string? AssignedTeam { get; set; }
        public DateTime? DueDate { get; set; }
        public string? Status { get; set; }
        public int? AssignedTo { get; set; }
        public string? OrderCode { get; set; }
    }
}

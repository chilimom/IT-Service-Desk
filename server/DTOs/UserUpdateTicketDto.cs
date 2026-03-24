namespace ITServiceDesk.Api.DTOs
{
    public class UserUpdateTicketDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        // public string? Factory { get; set; }
        public string? EquipmentCode { get; set; }
        public string? Area { get; set; }
        public string? AssignedTeam { get; set; }
        public DateTime? DueDate { get; set; }
        public int CategoryId { get; set; }
        public int FactoryId { get; set; }
        public int? StatusId { get; set; }
    }
}

namespace ITServiceDesk.Api.DTOs
{
    public class UpdateTicketDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public int FactoryId { get; set; }
        public int CategoryId { get; set; }
        public int? MaintenanceTypeId { get; set; }
        public string? EquipmentCode { get; set; }
        public string? Area { get; set; }
        public string? AssignedTeam { get; set; }
        public DateTime? DueDate { get; set; }
        public int? StatusId { get; set; }
        public int? AssignedTo { get; set; }
        public string? OrderCode { get; set; }
    }
}

namespace ITServiceDesk.Api.DTOs
{
    public class CreateTicketDto
    {
        // public string Type { get; set; } = "";
        public int CategoryId { get; set; }
        public int FactoryId { get; set; }
        public int? StatusId { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        // public string? Factory { get; set; }
        public string? EquipmentCode { get; set; }
        public string? Area { get; set; }
        public int? RequestedBy { get; set; }
        public string? AssignedTeam { get; set; }
        // public int CategoryId { get; set; }// Thêm trường CategoryId
        public DateTime? DueDate { get; set; }
        public int? MaintenanceTypeId { get; set; } // Thêm dòng này
    }
}

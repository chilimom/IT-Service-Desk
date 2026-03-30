namespace ITServiceDesk.Api.DTOs
{
    public class TicketResponseDto
    {
        public int Id { get; set; }
        public string? Code { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? EquipmentCode { get; set; }
        public string? Area { get; set; }
        public string? AssignedTeam { get; set; }
        public string? OrderCode { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DueDate { get; set; }
        public int CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string? CategoryType { get; set; }
        public int FactoryId { get; set; }
        public string? FactoryName { get; set; }
        public string? FactoryCode { get; set; }
        public int? StatusId { get; set; }
        public string? Status { get; set; }
        public int? RequestedBy { get; set; }
        public string? RequestedByName { get; set; }
        public int? AssignedTo { get; set; }
        public string? AssignedToName { get; set; }
        public string? LoaiTicket { get; set; }
        public int? MaintenanceTypeId { get; set; }
        public string? MaintenanceTypeCode { get; set; }
        public string? MaintenanceTypeName { get; set; }
    }
}

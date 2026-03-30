namespace ITServiceDesk.Api.Models
{
    public class Ticket
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public int FactoryId { get; set; }
        public int? StatusId { get; set; }
        public string? Code { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? EquipmentCode { get; set; }
        public string? Area { get; set; }
        public int RequestedBy { get; set; }
        public int? AssignedTo { get; set; }
        public string? AssignedTeam { get; set; }
        public string? OrderCode { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DueDate { get; set; }
        public bool? IsDeleted { get; set; } = false;
        public Category Category { get; set; } = null!;
        public int? MaintenanceTypeId { get; set; }
        public MaintenanceType? MaintenanceType { get; set; }
    }
}

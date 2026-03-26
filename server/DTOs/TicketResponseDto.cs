// namespace ITServiceDesk.Api.DTOs
// {
//     public class TicketResponseDto
//     {
//         public int Id { get; set; }
//         public string? Code { get; set; }
//         // public string Type { get; set; } = "";
//         public string? Title { get; set; }
//         public string? Description { get; set; }
//         // public string? Factory { get; set; }
//         public string? EquipmentCode { get; set; }
//         public string? Area { get; set; }
//         public int? RequestedBy { get; set; }
//         public string? RequestedByName { get; set; }
//         public int? AssignedTo { get; set; }
//         public string? AssignedToName { get; set; }
//         public string? AssignedTeam { get; set; }
//         // public string Status { get; set; } = "Submitted";
//         public string? OrderCode { get; set; }
//         public DateTime CreatedAt { get; set; }
//         public DateTime? UpdatedAt { get; set; }
//         public DateTime? DueDate { get; set; }
//         public int CategoryId { get; set; }
//         public int FactoryId { get; set; }
//         public int? StatusId { get; set; }
//         public string CategoryName { get; set; }   // ✅ THÊM
//         public string LoaiTicket { get; set; }     // ✅ THÊM
//         public string FactoryName { get; set; }    // ✅ THÊM
//         public string Status { get; set; }         // ✅ THÊM
//     }
// }
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

        // Category
        public int CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string? CategoryType { get; set; }

        // Factory
        public int FactoryId { get; set; }
        public string? FactoryName { get; set; }
        public string? FactoryCode { get; set; }

        // Status
        public int? StatusId { get; set; }
        public string? Status { get; set; }

        // User
        public int? RequestedBy { get; set; }
        public string? RequestedByName { get; set; }
        public int? AssignedTo { get; set; }
        public string? AssignedToName { get; set; }

        // Type (tạm thời giữ cho tương thích)
        public string? LoaiTicket { get; set; }
        public int? MaintenanceTypeId { get; set; }
        public string? MaintenanceTypeCode { get; set; }
        public string? MaintenanceTypeName { get; set; }
    }
}
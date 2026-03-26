// // namespace ITServiceDesk.Api.DTOs
// // {
// //     public class UpdateTicketDto
// //     {
// //         public string? Title { get; set; }
// //         public string? Description { get; set; }
// //         // public string? Factory { get; set; }
// //         public string? EquipmentCode { get; set; }
// //         public string? Area { get; set; }
// //         public string? AssignedTeam { get; set; }
// //         public DateTime? DueDate { get; set; }
// //         // public string? Status { get; set; }
// //         public int? AssignedTo { get; set; }
// //         public string? OrderCode { get; set; }
// //         public int CategoryId { get; set; }
// //         public int FactoryId { get; set; }
// //         public int? StatusId { get; set; }
// //     }
// // }
// namespace ITServiceDesk.Api.DTOs
// {
//     public class UpdateTicketDto
//     {
//         public string? Title { get; set; }
//         public string? Description { get; set; }

//         public string? EquipmentCode { get; set; }
//         public string? Area { get; set; }
//         public string? AssignedTeam { get; set; }

//         public DateTime? DueDate { get; set; }

//         public int? AssignedTo { get; set; }
//         public string? OrderCode { get; set; }

//         public int? CategoryId { get; set; }   // ✅ FIX
//         public int? FactoryId { get; set; }    // ✅ FIX
//         public int? StatusId { get; set; }     // OK
//     }
// }
namespace ITServiceDesk.Api.DTOs
{
    public class UpdateTicketDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public int FactoryId { get; set; }  // int, không nullable
        public int CategoryId { get; set; } // int, không nullable
        public string? EquipmentCode { get; set; }
        public string? Area { get; set; }
        public string? AssignedTeam { get; set; }
        public DateTime? DueDate { get; set; }
        public int? StatusId { get; set; }   // int? (nullable)
        public int? AssignedTo { get; set; } // int? (nullable)
        public string? OrderCode { get; set; }
    }
}
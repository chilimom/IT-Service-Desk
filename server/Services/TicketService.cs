// using ITServiceDesk.Api.Data;
// using ITServiceDesk.Api.DTOs;
// using ITServiceDesk.Api.Models;

// namespace ITServiceDesk.Api.Services
// {
//     public class TicketService
//     {
//         private readonly AppDbContext _context;

//         public TicketService(AppDbContext context)
//         {
//             _context = context;
//         }

//         public List<TicketResponseDto> GetAll()
//         {
//             return _context.Tickets
//                 .Select(ticket => new TicketResponseDto
//                 {
//                     Id = ticket.Id,
//                     Code = ticket.Code,

//                     Title = ticket.Title,
//                     Description = ticket.Description,

//                     CategoryName = _context.Categories
//                         .Where(c => c.Id == ticket.CategoryId)
//                         .Select(c => c.Name)
//                         .FirstOrDefault(),

//                     LoaiTicket = _context.LoaiTicket
//                         .Where(lt => lt.Id == _context.Categories
//                             .Where(c => c.Id == ticket.CategoryId)
//                             .Select(c => c.LoaiTicketId)
//                             .FirstOrDefault())
//                         .Select(lt => lt.TenLoai)
//                         .FirstOrDefault(),

//                     FactoryName = _context.Factories
//                         .Where(f => f.Id == ticket.FactoryId)
//                         .Select(f => f.Name)
//                         .FirstOrDefault(),

//                     Status = _context.Statuses
//                         .Where(s => s.Id == ticket.StatusId)
//                         .Select(s => s.Name)
//                         .FirstOrDefault(),

//                     EquipmentCode = ticket.EquipmentCode,
//                     Area = ticket.Area,
//                     AssignedTeam = ticket.AssignedTeam,
//                     CreatedAt = ticket.CreatedAt,
//                     DueDate = ticket.DueDate
//                 })
//                 .ToList();
//         }
//         public TicketResponseDto? GetById(int id)
//         {
//             return _context.Tickets
//                 .Where(ticket => ticket.Id == id)
//                 .Select(ticket => new TicketResponseDto
//                 {
//                     Id = ticket.Id,
//                     Code = ticket.Code,
//                     CategoryName = _context.Categories
//     .Where(c => c.Id == ticket.CategoryId)
//     .Select(c => c.Name)
//     .FirstOrDefault(),
//                     // Type = ticket.Type,
//                     Title = ticket.Title,
//                     Description = ticket.Description,
//                     // Factory = ticket.Factory,
//                     FactoryName = _context.Factories
//     .Where(f => f.Id == ticket.FactoryId)
//     .Select(f => f.Name)
//     .FirstOrDefault(),
//                     EquipmentCode = ticket.EquipmentCode,
//                     Area = ticket.Area,
//                     RequestedBy = ticket.RequestedBy,
//                     RequestedByName = _context.Users
//                         .Where(user => user.Id == ticket.RequestedBy)
//                         .Select(user => user.Username)
//                         .FirstOrDefault(),
//                     AssignedTo = ticket.AssignedTo,
//                     AssignedToName = _context.Users
//                         .Where(user => user.Id == ticket.AssignedTo)
//                         .Select(user => user.Username)
//                         .FirstOrDefault(),
//                     AssignedTeam = ticket.AssignedTeam,
//                     // Status = ticket.Status,
//                     Status = _context.Statuses
//     .Where(s => s.Id == ticket.StatusId)
//     .Select(s => s.Name)
//     .FirstOrDefault(),
//                     OrderCode = ticket.OrderCode,
//                     CreatedAt = ticket.CreatedAt,
//                     UpdatedAt = ticket.UpdatedAt,
//                     DueDate = ticket.DueDate
//                 })
//                 .FirstOrDefault();
//         }
//         public List<TicketResponseDto> GetByUser(int userId)
//         {
//             return _context.Tickets
//                 .Where(t => t.RequestedBy == userId)
//                 .Select(t => new TicketResponseDto
//                 {
//                     Id = t.Id,
//                     Code = t.Code,
//                     Title = t.Title,
//                     Description = t.Description,
//                     CategoryId = t.CategoryId,
//                     FactoryId = t.FactoryId,
//                     StatusId = t.StatusId,
//                     RequestedBy = t.RequestedBy,
//                     CreatedAt = t.CreatedAt
//                 })
//                 .ToList();
//         }
//         public object Create(CreateTicketDto dto)
//         {
//             if (dto.CategoryId <= 0)
//                 throw new Exception("CategoryId khong hop le");

//             var category = _context.Categories.Find(dto.CategoryId);
//             if (category == null)
//                 throw new Exception("Category khong ton tai");

//             if (dto.FactoryId <= 0)
//                 throw new Exception("FactoryId khong hop le");

//             var factory = _context.Factories.Find(dto.FactoryId);
//             if (factory == null)
//                 throw new Exception("Factory khong ton tai");
//             //có sửa
//             var createdBy = dto.RequestedBy ?? 0;
//             if (createdBy <= 0)
//                 throw new Exception("RequestedBy khong hop le");

//             var ticket = new Ticket
//             {
//                 Code = GenerateCode(),
//                 CategoryId = dto.CategoryId,
//                 FactoryId = dto.FactoryId,   // ✅ FIX

//                 Title = string.IsNullOrWhiteSpace(dto.Title)
//                     ? category.Name
//                     : dto.Title,

//                 Description = dto.Description ?? "",
//                 EquipmentCode = dto.EquipmentCode ?? "",
//                 Area = dto.Area ?? "",
//                 RequestedBy = createdBy,
//                 AssignedTeam = dto.AssignedTeam ?? "",
//                 DueDate = dto.DueDate,

//                 StatusId = 1,  // ✅ Submitted
//                 CreatedAt = DateTime.UtcNow
//             };

//             _context.Tickets.Add(ticket);
//             _context.SaveChanges();

//             return new
//             {
//                 ticket.Id,
//                 ticket.Code,
//                 ticket.Title,
//                 ticket.CategoryId,
//                 CategoryName = category.Name,
//                 ticket.FactoryId,
//                 FactoryName = factory.Name,
//                 ticket.StatusId,
//                 ticket.CreatedAt
//             };
//         }
//         public List<TicketLog> GetTicketLogs(int ticketId)
//         {
//             return _context.TicketLogs
//                 .Where(log => log.TicketId == ticketId)
//                 .OrderByDescending(log => log.CreatedAt)
//                 .ToList();
//         }

//         private string GenerateCode()
//         {
//             return $"TKT-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString("N")[..6]}";
//         }


//         public bool Update(int id, UpdateTicketDto dto)
//         {
//             var ticket = _context.Tickets.FirstOrDefault(t => t.Id == id);
//             if (ticket == null)
//                 return false;

//             if (dto.Title != null)
//                 ticket.Title = dto.Title;

//             if (dto.Description != null)
//                 ticket.Description = dto.Description;

//             if (dto.FactoryId != null)
//                 ticket.FactoryId = dto.FactoryId.Value;

//             if (dto.CategoryId != null)
//                 ticket.CategoryId = dto.CategoryId.Value;

//             if (dto.EquipmentCode != null)
//                 ticket.EquipmentCode = dto.EquipmentCode;

//             if (dto.Area != null)
//                 ticket.Area = dto.Area;

//             if (dto.AssignedTeam != null)
//                 ticket.AssignedTeam = dto.AssignedTeam;

//             if (dto.DueDate != null)
//                 ticket.DueDate = dto.DueDate;

//             if (dto.StatusId != null)
//                 ticket.StatusId = dto.StatusId.Value;

//             if (dto.AssignedTo != null)
//                 ticket.AssignedTo = dto.AssignedTo;

//             if (dto.OrderCode != null)
//                 ticket.OrderCode = dto.OrderCode;

//             ticket.UpdatedAt = DateTime.UtcNow;

//             _context.SaveChanges();

//             _context.TicketLogs.Add(new TicketLog
//             {
//                 TicketId = ticket.Id,
//                 Action = "Updated",
//                 Note = $"Update ticket: StatusId={dto.StatusId}, FactoryId={dto.FactoryId}",
//                 CreatedBy = 1,
//                 CreatedAt = DateTime.UtcNow
//             });

//             _context.SaveChanges();

//             return true;
//         }
//         public bool UserUpdate(int id, UserUpdateTicketDto dto)
//         {
//             var ticket = _context.Tickets.FirstOrDefault(t => t.Id == id);

//             if (ticket == null)
//                 return false;

//             var normalizedStatus = ticket.StatusId = dto.StatusId ?? 1;// sửa
//             if (ticket.StatusId == 2 || ticket.StatusId == 1)
//                 return false;

//             if (dto.Title != null)
//                 ticket.Title = dto.Title;

//             if (dto.Description != null)
//                 ticket.Description = dto.Description;

//             // if (dto.Factory != null)
//             //     ticket.Factory = dto.Factory;
//             if (dto.FactoryId != null)
//                 ticket.FactoryId = dto.FactoryId;

//             if (dto.EquipmentCode != null)
//                 ticket.EquipmentCode = dto.EquipmentCode;

//             if (dto.Area != null)
//                 ticket.Area = dto.Area;

//             if (dto.AssignedTeam != null)
//                 ticket.AssignedTeam = dto.AssignedTeam;

//             ticket.DueDate = dto.DueDate;
//             ticket.UpdatedAt = DateTime.UtcNow;

//             _context.SaveChanges();
//             _context.TicketLogs.Add(new TicketLog
//             {
//                 TicketId = ticket.Id,
//                 Action = "UserUpdated",
//                 Note = "Nguoi dung cap nhat thong tin ticket",
//                 CreatedBy = ticket.RequestedBy,
//                 CreatedAt = DateTime.UtcNow
//             });
//             _context.SaveChanges();

//             return true;
//         }

//         public bool Delete(int id)
//         {
//             var ticket = _context.Tickets.FirstOrDefault(t => t.Id == id);

//             if (ticket == null)
//                 return false;

//             var logs = _context.TicketLogs.Where(log => log.TicketId == id).ToList();
//             if (logs.Count > 0)
//                 _context.TicketLogs.RemoveRange(logs);

//             _context.Tickets.Remove(ticket);
//             _context.SaveChanges();

//             return true;
//         }
//         public object GetFactories()
//         {
//             return _context.Factories
//                 .Select(f => new
//                 {
//                     id = f.Id,
//                     name = f.Name,
//                     code = f.Code
//                 })
//                 .ToList();
//         }
//         public object GetDashboard()
//         {
//             var total = _context.Tickets.Count();

//             var byStatus = _context.Tickets
//                 .GroupBy(t => t.StatusId)
//                 .Select(group => new
//                 {
//                     Status = group.Key,
//                     Count = group.Count()
//                 })
//                 .ToList();

//             var today = DateTime.UtcNow.Date;
//             var todayCount = _context.Tickets.Count(ticket => ticket.CreatedAt >= today);

//             return new
//             {
//                 Total = total,
//                 Today = todayCount,
//                 ByStatus = byStatus
//             };
//         }
//     }
// }
using ITServiceDesk.Api.Data;
using ITServiceDesk.Api.DTOs;
using ITServiceDesk.Api.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ITServiceDesk.Api.Services
{
    public class TicketService
    {
        private readonly AppDbContext _context;

        public TicketService(AppDbContext context)
        {
            _context = context;
        }

        // ==================== GET METHODS ====================

        public List<TicketResponseDto> GetAll()
        {
            return _context.Tickets
                .Where(t => t.IsDeleted != true)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => MapToTicketResponseDto(t))
                .ToList();
        }

        // public TicketResponseDto? GetById(int id)
        // {
        //     return _context.Tickets
        //         .Where(t => t.Id == id && t.IsDeleted != true)
        //         .Select(t => MapToTicketResponseDto(t))
        //         .FirstOrDefault();
        // }
        public TicketResponseDto? GetById(int id)
        {
            return _context.Tickets
                .Where(t => t.Id == id && t.IsDeleted != true)
                .Select(t => new TicketResponseDto
                {
                    Id = t.Id,
                    Code = t.Code,
                    Title = t.Title,
                    Description = t.Description,
                    EquipmentCode = t.EquipmentCode,
                    Area = t.Area,
                    AssignedTeam = t.AssignedTeam,
                    OrderCode = t.OrderCode,
                    CreatedAt = t.CreatedAt,
                    UpdatedAt = t.UpdatedAt,
                    DueDate = t.DueDate,
                    CategoryId = t.CategoryId,
                    CategoryName = _context.Categories
                        .Where(c => c.Id == t.CategoryId)
                        .Select(c => c.Name)
                        .FirstOrDefault(),
                    CategoryType = _context.Categories
                        .Where(c => c.Id == t.CategoryId)
                        .Select(c => c.Type)
                        .FirstOrDefault(),
                    FactoryId = t.FactoryId,
                    FactoryName = _context.Factories
                        .Where(f => f.Id == t.FactoryId)
                        .Select(f => f.Name)
                        .FirstOrDefault(),
                    FactoryCode = _context.Factories
                        .Where(f => f.Id == t.FactoryId)
                        .Select(f => f.Code)
                        .FirstOrDefault(),
                    StatusId = t.StatusId,
                    Status = _context.Statuses
                        .Where(s => s.Id == t.StatusId)
                        .Select(s => s.Name)
                        .FirstOrDefault(),
                    RequestedBy = t.RequestedBy,
                    RequestedByName = _context.Users
                        .Where(u => u.Id == t.RequestedBy)
                        .Select(u => u.Username)
                        .FirstOrDefault(),
                    AssignedTo = t.AssignedTo,
                    AssignedToName = _context.Users
                        .Where(u => u.Id == t.AssignedTo)
                        .Select(u => u.Username)
                        .FirstOrDefault()
                    // Trong Select của GetById và GetMyTickets, thêm:
MaintenanceTypeId = t.MaintenanceTypeId,
                    MaintenanceTypeCode = _context.MaintenanceTypes
    .Where(m => m.Id == t.MaintenanceTypeId)
    .Select(m => m.Code)
    .FirstOrDefault(),
                    MaintenanceTypeName = _context.MaintenanceTypes
    .Where(m => m.Id == t.MaintenanceTypeId)
    .Select(m => m.Name)
    .FirstOrDefault(),
                })
                .FirstOrDefault();
        }
        public List<TicketResponseDto> GetByUser(int userId)
        {
            return _context.Tickets
                .Where(t => t.RequestedBy == userId && t.IsDeleted != true)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => MapToTicketResponseDto(t))
                .ToList();
        }

        public object GetMyTickets(int userId)
        {
            return _context.Tickets
                .Where(t => t.RequestedBy == userId && t.IsDeleted != true)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new
                {
                    t.Id,
                    t.Code,
                    t.Title,
                    t.Description,
                    t.EquipmentCode,
                    t.Area,
                    t.RequestedBy,
                    RequestedByName = _context.Users
                        .Where(u => u.Id == t.RequestedBy)
                        .Select(u => u.Username)
                        .FirstOrDefault(),
                    t.AssignedTo,
                    AssignedToName = _context.Users
                        .Where(u => u.Id == t.AssignedTo)
                        .Select(u => u.Username)
                        .FirstOrDefault(),
                    t.AssignedTeam,
                    t.OrderCode,
                    t.CreatedAt,
                    t.UpdatedAt,
                    t.DueDate,
                    t.CategoryId,
                    CategoryName = _context.Categories
                        .Where(c => c.Id == t.CategoryId)
                        .Select(c => c.Name)
                        .FirstOrDefault(),
                    CategoryType = _context.Categories
                        .Where(c => c.Id == t.CategoryId)
                        .Select(c => c.Type)
                        .FirstOrDefault(),
                    t.FactoryId,
                    FactoryName = _context.Factories
                        .Where(f => f.Id == t.FactoryId)
                        .Select(f => f.Name)
                        .FirstOrDefault(),
                    FactoryCode = _context.Factories
                        .Where(f => f.Id == t.FactoryId)
                        .Select(f => f.Code)
                        .FirstOrDefault(),
                    t.StatusId,
                    Status = _context.Statuses
                        .Where(s => s.Id == t.StatusId)
                        .Select(s => s.Name)
                        .FirstOrDefault()
                    MaintenanceTypeId = t.MaintenanceTypeId,
                    MaintenanceTypeCode = _context.MaintenanceTypes
    .Where(m => m.Id == t.MaintenanceTypeId)
    .Select(m => m.Code)
    .FirstOrDefault(),
                    MaintenanceTypeName = _context.MaintenanceTypes
    .Where(m => m.Id == t.MaintenanceTypeId)
    .Select(m => m.Name)
    .FirstOrDefault(),
                })
                .ToList();
        }

        public List<TicketLog> GetTicketLogs(int ticketId)
        {
            return _context.TicketLogs
                .Where(log => log.TicketId == ticketId)
                .OrderByDescending(log => log.CreatedAt)
                .ToList();
        }

        public object GetFactories()
        {
            return _context.Factories
                .Select(f => new
                {
                    id = f.Id,
                    name = f.Name,
                    code = f.Code
                })
                .ToList();
        }

        public object GetDashboard()
        {
            var total = _context.Tickets.Count(t => t.IsDeleted != true);
            var today = DateTime.UtcNow.Date;
            var todayCount = _context.Tickets.Count(t => t.CreatedAt >= today && t.IsDeleted != true);

            var byStatus = _context.Tickets
                .Where(t => t.IsDeleted != true)
                .GroupBy(t => t.StatusId)
                .Select(g => new
                {
                    StatusId = g.Key,
                    StatusName = _context.Statuses
                        .Where(s => s.Id == g.Key)
                        .Select(s => s.Name)
                        .FirstOrDefault(),
                    Count = g.Count()
                })
                .ToList();

            return new
            {
                Total = total,
                Today = todayCount,
                ByStatus = byStatus
            };
        }

        // ==================== CREATE METHODS ====================

        public object Create(CreateTicketDto dto)
        {
            // Validate Category
            if (dto.CategoryId <= 0)
                throw new Exception("CategoryId không hợp lệ");

            var category = _context.Categories.Find(dto.CategoryId);
            if (category == null)
                throw new Exception("Category không tồn tại");

            // Validate Factory
            if (dto.FactoryId <= 0)
                throw new Exception("FactoryId không hợp lệ");

            var factory = _context.Factories.Find(dto.FactoryId);
            if (factory == null)
                throw new Exception("Factory không tồn tại");

            // Validate User
            var requestedBy = dto.RequestedBy ?? 0;
            if (requestedBy <= 0)
                throw new Exception("RequestedBy không hợp lệ");

            var user = _context.Users.Find(requestedBy);
            if (user == null)
                throw new Exception("User không tồn tại");

            // Create ticket
            var ticket = new Ticket
            {
                Code = GenerateCode(),
                CategoryId = dto.CategoryId,
                FactoryId = dto.FactoryId,
                MaintenanceTypeId = dto.MaintenanceTypeId, // Thêm dòng này
                Title = string.IsNullOrWhiteSpace(dto.Title) ? category.Name : dto.Title.Trim(),
                Description = dto.Description?.Trim() ?? "",
                EquipmentCode = dto.EquipmentCode?.Trim() ?? "",
                Area = dto.Area?.Trim() ?? "",
                RequestedBy = requestedBy,
                AssignedTeam = dto.AssignedTeam?.Trim() ?? "",
                DueDate = dto.DueDate,
                StatusId = 1, // Submitted
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };

            _context.Tickets.Add(ticket);
            _context.SaveChanges();

            // Add log
            _context.TicketLogs.Add(new TicketLog
            {
                TicketId = ticket.Id,
                Action = "Created",
                Note = $"Ticket được tạo bởi user {requestedBy}",
                CreatedBy = requestedBy,
                CreatedAt = DateTime.UtcNow
            });
            _context.SaveChanges();

            return new
            {
                ticket.Id,
                ticket.Code,
                ticket.Title,
                ticket.CategoryId,
                CategoryName = category.Name,
                ticket.FactoryId,
                FactoryName = factory.Name,
                ticket.StatusId,
                ticket.CreatedAt
            };
        }
        // ==================== UPDATE METHODS ====================

        public bool Update(int id, UpdateTicketDto dto)
        {
            var ticket = _context.Tickets.FirstOrDefault(t => t.Id == id && t.IsDeleted != true);
            if (ticket == null)
                return false;

            bool hasChanges = false;

            if (!string.IsNullOrWhiteSpace(dto.Title))
            {
                ticket.Title = dto.Title.Trim();
                hasChanges = true;
            }

            if (!string.IsNullOrWhiteSpace(dto.Description))
            {
                ticket.Description = dto.Description.Trim();
                hasChanges = true;
            }

            // FactoryId là int, không phải nullable, chỉ update nếu có giá trị khác 0
            if (dto.FactoryId > 0)
            {
                ticket.FactoryId = dto.FactoryId;
                hasChanges = true;
            }

            // CategoryId là int, không phải nullable
            if (dto.CategoryId > 0)
            {
                ticket.CategoryId = dto.CategoryId;
                hasChanges = true;
            }

            if (!string.IsNullOrWhiteSpace(dto.EquipmentCode))
            {
                ticket.EquipmentCode = dto.EquipmentCode.Trim();
                hasChanges = true;
            }

            if (!string.IsNullOrWhiteSpace(dto.Area))
            {
                ticket.Area = dto.Area.Trim();
                hasChanges = true;
            }

            if (!string.IsNullOrWhiteSpace(dto.AssignedTeam))
            {
                ticket.AssignedTeam = dto.AssignedTeam.Trim();
                hasChanges = true;
            }

            if (dto.DueDate.HasValue)
            {
                ticket.DueDate = dto.DueDate.Value;
                hasChanges = true;
            }

            // StatusId là int? (nullable)
            if (dto.StatusId.HasValue)
            {
                ticket.StatusId = dto.StatusId.Value;
                hasChanges = true;
            }

            // AssignedTo là int? (nullable)
            if (dto.AssignedTo.HasValue)
            {
                ticket.AssignedTo = dto.AssignedTo.Value;
                hasChanges = true;
            }

            if (!string.IsNullOrWhiteSpace(dto.OrderCode))
            {
                ticket.OrderCode = dto.OrderCode.Trim();
                hasChanges = true;
            }

            if (!hasChanges)
                return true;

            ticket.UpdatedAt = DateTime.UtcNow;
            _context.SaveChanges();

            _context.TicketLogs.Add(new TicketLog
            {
                TicketId = ticket.Id,
                Action = "AdminUpdated",
                Note = $"Admin cập nhật ticket",
                CreatedBy = 1,
                CreatedAt = DateTime.UtcNow
            });
            _context.SaveChanges();

            return true;
        }

        public bool UserUpdate(int id, UserUpdateTicketDto dto)
        {
            var ticket = _context.Tickets.FirstOrDefault(t => t.Id == id && t.IsDeleted != true);
            if (ticket == null)
                return false;

            // User chỉ được sửa khi status là Submitted (StatusId = 1)
            if (ticket.StatusId != 1)
                return false;

            bool hasChanges = false;

            if (!string.IsNullOrWhiteSpace(dto.Title))
            {
                ticket.Title = dto.Title.Trim();
                hasChanges = true;
            }

            if (!string.IsNullOrWhiteSpace(dto.Description))
            {
                ticket.Description = dto.Description.Trim();
                hasChanges = true;
            }

            // FactoryId là int, không phải nullable
            if (dto.FactoryId > 0)
            {
                ticket.FactoryId = dto.FactoryId;
                hasChanges = true;
            }

            if (!string.IsNullOrWhiteSpace(dto.EquipmentCode))
            {
                ticket.EquipmentCode = dto.EquipmentCode.Trim();
                hasChanges = true;
            }

            if (!string.IsNullOrWhiteSpace(dto.Area))
            {
                ticket.Area = dto.Area.Trim();
                hasChanges = true;
            }

            if (!string.IsNullOrWhiteSpace(dto.AssignedTeam))
            {
                ticket.AssignedTeam = dto.AssignedTeam.Trim();
                hasChanges = true;
            }

            if (dto.DueDate.HasValue)
            {
                ticket.DueDate = dto.DueDate.Value;
                hasChanges = true;
            }

            if (!hasChanges)
                return true;

            ticket.UpdatedAt = DateTime.UtcNow;
            _context.SaveChanges();

            _context.TicketLogs.Add(new TicketLog
            {
                TicketId = ticket.Id,
                Action = "UserUpdated",
                Note = "Người dùng cập nhật thông tin ticket",
                CreatedBy = ticket.RequestedBy,
                CreatedAt = DateTime.UtcNow
            });
            _context.SaveChanges();

            return true;
        }

        // ==================== DELETE METHODS ====================

        public bool Delete(int id)
        {
            var ticket = _context.Tickets.FirstOrDefault(t => t.Id == id);
            if (ticket == null)
                return false;

            // Soft delete
            ticket.IsDeleted = true;
            ticket.UpdatedAt = DateTime.UtcNow;

            _context.SaveChanges();

            _context.TicketLogs.Add(new TicketLog
            {
                TicketId = ticket.Id,
                Action = "Deleted",
                Note = "Ticket bị xóa",
                CreatedBy = ticket.RequestedBy,
                CreatedAt = DateTime.UtcNow
            });
            _context.SaveChanges();

            return true;
        }

        // ==================== PRIVATE METHODS ====================

        private string GenerateCode()
        {
            return $"TKT-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString("N")[..6]}";
        }

        private static TicketResponseDto MapToTicketResponseDto(Ticket ticket)
        {
            return new TicketResponseDto
            {
                Id = ticket.Id,
                Code = ticket.Code,
                Title = ticket.Title,
                Description = ticket.Description,
                EquipmentCode = ticket.EquipmentCode,
                Area = ticket.Area,
                AssignedTeam = ticket.AssignedTeam,
                OrderCode = ticket.OrderCode,
                CreatedAt = ticket.CreatedAt,
                UpdatedAt = ticket.UpdatedAt,
                DueDate = ticket.DueDate,
                CategoryId = ticket.CategoryId,
                FactoryId = ticket.FactoryId,
                StatusId = ticket.StatusId,
                RequestedBy = ticket.RequestedBy,
                AssignedTo = ticket.AssignedTo
            };
        }
        public List<MaintenanceTypeDto> GetMaintenanceTypes()
        {
            return _context.MaintenanceTypes
                .Where(m => m.IsActive)
                .Select(m => new MaintenanceTypeDto
                {
                    Id = m.Id,
                    Code = m.Code,
                    Name = m.Name,
                    Description = m.Description
                })
                .ToList();
        }
    }
}
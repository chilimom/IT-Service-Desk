
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
                        .FirstOrDefault(),
                    MaintenanceTypeId = t.MaintenanceTypeId,
                    MaintenanceTypeCode = _context.MaintenanceTypes
                        .Where(m => m.Id == t.MaintenanceTypeId)
                        .Select(m => m.Code)
                        .FirstOrDefault(),
                    MaintenanceTypeName = _context.MaintenanceTypes
                        .Where(m => m.Id == t.MaintenanceTypeId)
                        .Select(m => m.Name)
                        .FirstOrDefault()
                })
                .ToList();
        }

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
                        .FirstOrDefault(),
                    MaintenanceTypeId = t.MaintenanceTypeId,
                    MaintenanceTypeCode = _context.MaintenanceTypes
                        .Where(m => m.Id == t.MaintenanceTypeId)
                        .Select(m => m.Code)
                        .FirstOrDefault(),
                    MaintenanceTypeName = _context.MaintenanceTypes
                        .Where(m => m.Id == t.MaintenanceTypeId)
                        .Select(m => m.Name)
                        .FirstOrDefault()
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
                        .FirstOrDefault(),
                    MaintenanceTypeId = t.MaintenanceTypeId,
                    MaintenanceTypeCode = _context.MaintenanceTypes
                        .Where(m => m.Id == t.MaintenanceTypeId)
                        .Select(m => m.Code)
                        .FirstOrDefault(),
                    MaintenanceTypeName = _context.MaintenanceTypes
                        .Where(m => m.Id == t.MaintenanceTypeId)
                        .Select(m => m.Name)
                        .FirstOrDefault()
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
                MaintenanceTypeId = dto.MaintenanceTypeId,
                Title = string.IsNullOrWhiteSpace(dto.Title) ? category.Name : dto.Title.Trim(),
                Description = dto.Description?.Trim() ?? "",
                EquipmentCode = dto.EquipmentCode?.Trim() ?? "",
                Area = dto.Area?.Trim() ?? "",
                RequestedBy = requestedBy,
                AssignedTeam = dto.AssignedTeam?.Trim() ?? "",
                DueDate = dto.DueDate,
                StatusId = 3, // 3 = Submitted (Đã gửi)
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

            if (dto.FactoryId > 0)
            {
                ticket.FactoryId = dto.FactoryId;
                hasChanges = true;
            }

            if (dto.CategoryId > 0)
            {
                ticket.CategoryId = dto.CategoryId;
                hasChanges = true;
            }

            if (dto.MaintenanceTypeId.HasValue)
            {
                ticket.MaintenanceTypeId = dto.MaintenanceTypeId.Value;
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

            if (dto.StatusId.HasValue)
            {
                ticket.StatusId = dto.StatusId.Value;
                hasChanges = true;
            }

            if (dto.AssignedTo.HasValue)
            {
                ticket.AssignedTo = dto.AssignedTo.Value;
                // Khi admin tiếp nhận ticket (chọn người xử lý) và status đang là Submitted (3)
                if (ticket.StatusId == 3) // 3 = Submitted
                {
                    ticket.StatusId = 2; // 2 = InProgress (Đang xử lý)
                }
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

            // User chỉ được sửa khi status là Submitted (3)
            if (ticket.StatusId != 3) // 3 = Submitted
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

            if (dto.FactoryId > 0)
            {
                ticket.FactoryId = dto.FactoryId;
                hasChanges = true;
            }

            if (dto.MaintenanceTypeId.HasValue)
            {
                ticket.MaintenanceTypeId = dto.MaintenanceTypeId.Value;
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
    }
}

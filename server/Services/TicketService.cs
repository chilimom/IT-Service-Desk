using ITServiceDesk.Api.Data;
using ITServiceDesk.Api.DTOs;
using ITServiceDesk.Api.Models;

namespace ITServiceDesk.Api.Services
{
    public class TicketService
    {
        private readonly AppDbContext _context;

        public TicketService(AppDbContext context)
        {
            _context = context;
        }

        // public List<TicketResponseDto> GetAll()
        // {
        //     return _context.Tickets
        //         .Select(ticket => new TicketResponseDto
        //         {
        //             Id = ticket.Id,
        //             Code = ticket.Code,
        //             Type = ticket.Type,
        //             Title = ticket.Title,
        //             Description = ticket.Description,
        //             Factory = ticket.Factory,
        //             EquipmentCode = ticket.EquipmentCode,
        //             Area = ticket.Area,
        //             RequestedBy = ticket.RequestedBy,
        //             RequestedByName = _context.Users
        //                 .Where(user => user.Id == ticket.RequestedBy)
        //                 .Select(user => user.Username)
        //                 .FirstOrDefault(),
        //             AssignedTo = ticket.AssignedTo,
        //             AssignedToName = _context.Users
        //                 .Where(user => user.Id == ticket.AssignedTo)
        //                 .Select(user => user.Username)
        //                 .FirstOrDefault(),
        //             AssignedTeam = ticket.AssignedTeam,
        //             Status = ticket.Status,
        //             OrderCode = ticket.OrderCode,
        //             CreatedAt = ticket.CreatedAt,
        //             UpdatedAt = ticket.UpdatedAt,
        //             DueDate = ticket.DueDate
        //         })
        //         .ToList();
        // }
        public List<TicketResponseDto> GetAll()
        {
            return _context.Tickets
                .Select(ticket => new TicketResponseDto
                {
                    Id = ticket.Id,
                    Code = ticket.Code,

                    Title = ticket.Title,
                    Description = ticket.Description,

                    CategoryName = _context.Categories
                        .Where(c => c.Id == ticket.CategoryId)
                        .Select(c => c.Name)
                        .FirstOrDefault(),

                    LoaiTicket = _context.LoaiTicket
                        .Where(lt => lt.Id == _context.Categories
                            .Where(c => c.Id == ticket.CategoryId)
                            .Select(c => c.LoaiTicketId)
                            .FirstOrDefault())
                        .Select(lt => lt.TenLoai)
                        .FirstOrDefault(),

                    FactoryName = _context.Factories
                        .Where(f => f.Id == ticket.FactoryId)
                        .Select(f => f.Name)
                        .FirstOrDefault(),

                    Status = _context.Statuses
                        .Where(s => s.Id == ticket.StatusId)
                        .Select(s => s.Name)
                        .FirstOrDefault(),

                    EquipmentCode = ticket.EquipmentCode,
                    Area = ticket.Area,
                    AssignedTeam = ticket.AssignedTeam,
                    CreatedAt = ticket.CreatedAt,
                    DueDate = ticket.DueDate
                })
                .ToList();
        }
        public TicketResponseDto? GetById(int id)
        {
            return _context.Tickets
                .Where(ticket => ticket.Id == id)
                .Select(ticket => new TicketResponseDto
                {
                    Id = ticket.Id,
                    Code = ticket.Code,
                    Type = ticket.Type,
                    Title = ticket.Title,
                    Description = ticket.Description,
                    Factory = ticket.Factory,
                    EquipmentCode = ticket.EquipmentCode,
                    Area = ticket.Area,
                    RequestedBy = ticket.RequestedBy,
                    RequestedByName = _context.Users
                        .Where(user => user.Id == ticket.RequestedBy)
                        .Select(user => user.Username)
                        .FirstOrDefault(),
                    AssignedTo = ticket.AssignedTo,
                    AssignedToName = _context.Users
                        .Where(user => user.Id == ticket.AssignedTo)
                        .Select(user => user.Username)
                        .FirstOrDefault(),
                    AssignedTeam = ticket.AssignedTeam,
                    Status = ticket.Status,
                    OrderCode = ticket.OrderCode,
                    CreatedAt = ticket.CreatedAt,
                    UpdatedAt = ticket.UpdatedAt,
                    DueDate = ticket.DueDate
                })
                .FirstOrDefault();
        }
        // public object Create(CreateTicketDto dto)
        // {
        //     if (dto.CategoryId <= 0)
        //         throw new Exception("CategoryId khong hop le");

        //     var category = _context.Categories.Find(dto.CategoryId);
        //     if (category == null)
        //         throw new Exception("Category khong ton tai");

        //     var createdBy = dto.RequestedBy ?? 1;

        //     var ticket = new Ticket
        //     {
        //         Code = GenerateCode(),
        //         CategoryId = dto.CategoryId,
        //         Title = string.IsNullOrWhiteSpace(dto.Title)
        //             ? category.Name
        //             : dto.Title,
        //         Description = dto.Description ?? "",
        //         Factory = dto.Factory,
        //         EquipmentCode = dto.EquipmentCode ?? "",
        //         Area = dto.Area ?? "",
        //         RequestedBy = createdBy,
        //         AssignedTeam = dto.AssignedTeam ?? "",
        //         DueDate = dto.DueDate,
        //         Status = "Submitted",
        //         CreatedAt = DateTime.UtcNow
        //     };

        //     _context.Tickets.Add(ticket);
        //     _context.SaveChanges();

        //     // 🔥 FIX LỖI 500 Ở ĐÂY
        //     return new
        //     {
        //         ticket.Id,
        //         ticket.Code,
        //         ticket.Title,
        //         ticket.Description,
        //         ticket.CategoryId,
        //         CategoryName = category.Name,
        //         ticket.Status,
        //         ticket.CreatedAt
        //     };
        // }
        public object Create(CreateTicketDto dto)
        {
            if (dto.CategoryId <= 0)
                throw new Exception("CategoryId khong hop le");

            var category = _context.Categories.Find(dto.CategoryId);
            if (category == null)
                throw new Exception("Category khong ton tai");

            if (dto.FactoryId <= 0)
                throw new Exception("FactoryId khong hop le");

            var factory = _context.Factories.Find(dto.FactoryId);
            if (factory == null)
                throw new Exception("Factory khong ton tai");

            var createdBy = dto.RequestedBy ?? 1;

            var ticket = new Ticket
            {
                Code = GenerateCode(),
                CategoryId = dto.CategoryId,
                FactoryId = dto.FactoryId,   // ✅ FIX

                Title = string.IsNullOrWhiteSpace(dto.Title)
                    ? category.Name
                    : dto.Title,

                Description = dto.Description ?? "",
                EquipmentCode = dto.EquipmentCode ?? "",
                Area = dto.Area ?? "",
                RequestedBy = createdBy,
                AssignedTeam = dto.AssignedTeam ?? "",
                DueDate = dto.DueDate,

                StatusId = 1,  // ✅ Submitted
                CreatedAt = DateTime.UtcNow
            };

            _context.Tickets.Add(ticket);
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
        public List<TicketLog> GetTicketLogs(int ticketId)
        {
            return _context.TicketLogs
                .Where(log => log.TicketId == ticketId)
                .OrderByDescending(log => log.CreatedAt)
                .ToList();
        }

        private string GenerateCode()
        {
            return $"TKT-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString("N")[..6]}";
        }

        public bool Update(int id, UpdateTicketDto dto)
        {
            var ticket = _context.Tickets.FirstOrDefault(t => t.Id == id);

            if (ticket == null)
                return false;

            if (dto.Title != null)
                ticket.Title = dto.Title;

            if (dto.Description != null)
                ticket.Description = dto.Description;

            // if (dto.Factory != null)
            //     ticket.Factory = dto.Factory;
            if (dto.FactoryId != null)
                ticket.FactoryId = dto.FactoryId.Value;
            if (dto.EquipmentCode != null)
                ticket.EquipmentCode = dto.EquipmentCode;

            if (dto.Area != null)
                ticket.Area = dto.Area;

            if (dto.AssignedTeam != null)
                ticket.AssignedTeam = dto.AssignedTeam;

            if (dto.DueDate != null)
                ticket.DueDate = dto.DueDate;

            // if (dto.Status != null)
            //     ticket.Status = dto.Status;
            if (dto.StatusId != null)
                ticket.StatusId = dto.StatusId.Value;
            if (dto.AssignedTo != null)
                ticket.AssignedTo = dto.AssignedTo;

            var nextStatus = dto.Status ?? ticket.Status;
            var normalizedNextStatus = (nextStatus ?? string.Empty).ToLower();
            if (ticket.AssignedTo == null && (normalizedNextStatus == "inprogress" || normalizedNextStatus == "done"))
                ticket.AssignedTo = 1;

            var normalizedType = (ticket.Type ?? string.Empty).ToLower();
            var isMaintenanceTicket = normalizedType.Contains("maintenance") || normalizedType.Contains("bao tri");

            if (dto.OrderCode != null && isMaintenanceTicket)
                ticket.OrderCode = dto.OrderCode;

            ticket.UpdatedAt = DateTime.UtcNow;

            _context.SaveChanges();
            _context.TicketLogs.Add(new TicketLog
            {
                TicketId = ticket.Id,
                Action = "Updated",
                Note = $"Cap nhat ticket: Title={dto.Title}, Description={dto.Description}, Factory={dto.Factory}, EquipmentCode={dto.EquipmentCode}, Area={dto.Area}, AssignedTeam={dto.AssignedTeam}, DueDate={dto.DueDate}, Status={dto.Status}, AssignedTo={dto.AssignedTo}, OrderCode={dto.OrderCode}",
                CreatedBy = 1,
                CreatedAt = DateTime.UtcNow
            });
            _context.SaveChanges();

            return true;
        }

        public bool UserUpdate(int id, UserUpdateTicketDto dto)
        {
            var ticket = _context.Tickets.FirstOrDefault(t => t.Id == id);

            if (ticket == null)
                return false;

            var normalizedStatus = (ticket.Status ?? string.Empty).ToLower();
            if (normalizedStatus == "inprogress" || normalizedStatus == "done")
                return false;

            if (dto.Title != null)
                ticket.Title = dto.Title;

            if (dto.Description != null)
                ticket.Description = dto.Description;

            if (dto.Factory != null)
                ticket.Factory = dto.Factory;

            if (dto.EquipmentCode != null)
                ticket.EquipmentCode = dto.EquipmentCode;

            if (dto.Area != null)
                ticket.Area = dto.Area;

            if (dto.AssignedTeam != null)
                ticket.AssignedTeam = dto.AssignedTeam;

            ticket.DueDate = dto.DueDate;
            ticket.UpdatedAt = DateTime.UtcNow;

            _context.SaveChanges();
            _context.TicketLogs.Add(new TicketLog
            {
                TicketId = ticket.Id,
                Action = "UserUpdated",
                Note = "Nguoi dung cap nhat thong tin ticket",
                CreatedBy = ticket.RequestedBy,
                CreatedAt = DateTime.UtcNow
            });
            _context.SaveChanges();

            return true;
        }

        public bool Delete(int id)
        {
            var ticket = _context.Tickets.FirstOrDefault(t => t.Id == id);

            if (ticket == null)
                return false;

            var logs = _context.TicketLogs.Where(log => log.TicketId == id).ToList();
            if (logs.Count > 0)
                _context.TicketLogs.RemoveRange(logs);

            _context.Tickets.Remove(ticket);
            _context.SaveChanges();

            return true;
        }

        public object GetDashboard()
        {
            var total = _context.Tickets.Count();

            var byStatus = _context.Tickets
                .GroupBy(t => t.Status)
                .Select(group => new
                {
                    Status = group.Key,
                    Count = group.Count()
                })
                .ToList();

            var today = DateTime.UtcNow.Date;
            var todayCount = _context.Tickets.Count(ticket => ticket.CreatedAt >= today);

            return new
            {
                Total = total,
                Today = todayCount,
                ByStatus = byStatus
            };
        }
    }
}

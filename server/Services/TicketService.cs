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

        public List<Ticket> GetAll()
        {
            return _context.Tickets.ToList();
        }

        public Ticket? GetById(int id)
        {
            return _context.Tickets.FirstOrDefault(ticket => ticket.Id == id);
        }

        public Ticket Create(CreateTicketDto dto)
        {
            var createdBy = dto.RequestedBy ?? 1;

            var ticket = new Ticket
            {
                Code = GenerateCode(),
                Type = dto.Type,
                Title = dto.Title,
                Description = dto.Description,
                EquipmentCode = dto.EquipmentCode,
                Area = dto.Area,
                RequestedBy = createdBy,
                AssignedTeam = dto.AssignedTeam,
                DueDate = dto.DueDate,
                Status = "Submitted",
                CreatedAt = DateTime.UtcNow
            };

            _context.Tickets.Add(ticket);
            _context.SaveChanges();

            _context.TicketLogs.Add(new TicketLog
            {
                TicketId = ticket.Id,
                Action = "Created",
                Note = "Tao ticket",
                CreatedBy = createdBy,
                CreatedAt = DateTime.UtcNow
            });
            _context.SaveChanges();

            return ticket;
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

            if (dto.EquipmentCode != null)
                ticket.EquipmentCode = dto.EquipmentCode;

            if (dto.Area != null)
                ticket.Area = dto.Area;

            if (dto.AssignedTeam != null)
                ticket.AssignedTeam = dto.AssignedTeam;

            if (dto.DueDate != null)
                ticket.DueDate = dto.DueDate;

            if (dto.Status != null)
                ticket.Status = dto.Status;

            if (dto.AssignedTo != null)
                ticket.AssignedTo = dto.AssignedTo;

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
                Note = $"Cap nhat ticket: Title={dto.Title}, Description={dto.Description}, EquipmentCode={dto.EquipmentCode}, Area={dto.Area}, AssignedTeam={dto.AssignedTeam}, DueDate={dto.DueDate}, Status={dto.Status}, AssignedTo={dto.AssignedTo}, OrderCode={dto.OrderCode}",
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

using Microsoft.EntityFrameworkCore;
using ITServiceDesk.Api.Models;

namespace ITServiceDesk.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<TicketLog> TicketLogs { get; set; }
        public DbSet<Category> Categories { get; set; }   // 👈 THÊM
        public DbSet<Category> Categories { get; set; }
        public DbSet<Factory> Factories { get; set; }   // ✅ THÊM
        public DbSet<Status> Statuses { get; set; }     // ✅ THÊM
        public DbSet<LoaiTicket> LoaiTicket { get; set; } // ✅ THÊM
    }


}
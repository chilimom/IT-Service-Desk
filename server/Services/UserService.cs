using ITServiceDesk.Api.Data;

namespace ITServiceDesk.Api.Services
{
    public class UserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public object GetAll()
        {
            return _context.Users
                .Select(user => new
                {
                    Id = user.Id,
                    Username = user.Username,
                    Role = user.Role
                })
                .ToList();
        }
    }
}

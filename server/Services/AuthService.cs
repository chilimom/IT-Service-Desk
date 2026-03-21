using ITServiceDesk.Api.Data;
using ITServiceDesk.Api.DTOs;

namespace ITServiceDesk.Api.Services
{
    public class AuthService
    {
        private readonly AppDbContext _context;

        public AuthService(AppDbContext context)
        {
            _context = context;
        }

        public object? Login(LoginDto dto)
        {
            var user = _context.Users.FirstOrDefault(item =>
                item.Username == dto.Username && item.PasswordHash == dto.Password);

            if (user == null)
                return null;

            return new
            {
                Id = user.Id,
                Username = user.Username,
                Role = user.Role
            };
        }
    }
}

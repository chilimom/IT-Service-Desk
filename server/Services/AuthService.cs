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
            var username = (dto.Username ?? string.Empty).Trim();
            var password = (dto.Password ?? string.Empty).Trim();

            var user = _context.Users.FirstOrDefault(item =>
                item.Username.Trim().ToLower() == username.ToLower() &&
                item.PasswordHash.Trim() == password);

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

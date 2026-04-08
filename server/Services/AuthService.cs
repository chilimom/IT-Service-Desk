using ITServiceDesk.Api.Data;
using ITServiceDesk.Api.DTOs;

namespace ITServiceDesk.Api.Services
{
    public class AuthService
    {
        private readonly AppDbContext _context;
        private readonly ExternalEmployeeService _externalEmployeeService;

        public AuthService(AppDbContext context, ExternalEmployeeService externalEmployeeService)
        {
            _context = context;
            _externalEmployeeService = externalEmployeeService;
        }

        public object? Login(LoginDto dto)
        {
            var username = (dto.Username ?? string.Empty).Trim();
            var password = (dto.Password ?? string.Empty).Trim();

            var user = _context.Users.FirstOrDefault(item =>
                item.Username.Trim().ToLower() == username.ToLower() &&
                item.PasswordHash.Trim() == password);

            if (user == null)
            {
                var employee = _externalEmployeeService.GetEmployeeByCredentials(username, password);
                if (employee != null)
                {
                    user = _externalEmployeeService.EnsureLocalUserForEmployee(employee);
                }
            }

            if (user == null)
                return null;

            return new
            {
                Id = user.Id,
                Username = user.Username,
                Role = user.Role,
                FullName = user.FullName,
                AuthorizedFactoryIds = user.AuthorizedFactoryIds,
                AuthorizedFactoryIdList = ParseAuthorizedFactoryIds(user.AuthorizedFactoryIds)
            };
        }

        private static List<int> ParseAuthorizedFactoryIds(string? rawFactoryIds)
        {
            return (rawFactoryIds ?? string.Empty)
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(value => int.TryParse(value, out var id) ? id : 0)
                .Where(id => id > 0)
                .Distinct()
                .ToList();
        }
    }
}

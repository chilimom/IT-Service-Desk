using ITServiceDesk.Api.Data;
using ITServiceDesk.Api.DTOs;

namespace ITServiceDesk.Api.Services
{
    public class AuthService
    {
        private readonly AppDbContext _context;
        private readonly ExternalEmployeeService _externalEmployeeService;
        private readonly PasswordService _passwordService;

        public AuthService(
            AppDbContext context,
            ExternalEmployeeService externalEmployeeService,
            PasswordService passwordService)
        {
            _context = context;
            _externalEmployeeService = externalEmployeeService;
            _passwordService = passwordService;
        }

        public object? Login(LoginDto dto)
        {
            var username = (dto.Username ?? string.Empty).Trim();
            var password = (dto.Password ?? string.Empty).Trim();

            var user = _context.Users.FirstOrDefault(item =>
                item.Username.Trim().ToLower() == username.ToLower());

            if (user != null)
            {
                var verificationResult = _passwordService.Verify(user, password);
                if (verificationResult == Microsoft.AspNetCore.Identity.PasswordVerificationResult.Failed)
                {
                    user = null;
                }
            }

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

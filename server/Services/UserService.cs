using ITServiceDesk.Api.Data;
using ITServiceDesk.Api.DTOs;
using ITServiceDesk.Api.Models;
using System;
using System.Linq;

namespace ITServiceDesk.Api.Services
{
    public class UserService
    {
        private readonly AppDbContext _context;
        private readonly ExternalEmployeeService _externalEmployeeService;
        private readonly PasswordService _passwordService;

        public UserService(
            AppDbContext context,
            ExternalEmployeeService externalEmployeeService,
            PasswordService passwordService)
        {
            _context = context;
            _externalEmployeeService = externalEmployeeService;
            _passwordService = passwordService;
        }

        public object GetAll()
        {
            return _context.Users
                .Select(user => new
                {
                    Id = user.Id,
                    Username = user.Username,
                    FullName = user.FullName,
                    Role = user.Role,
                    Department = user.Department,
                    CreatedAt = user.CreatedAt,
                    AuthorizedFactoryIds = user.AuthorizedFactoryIds
                })
                .AsEnumerable()
                .Select(user => new
                {
                    user.Id,
                    user.Username,
                    user.FullName,
                    user.Role,
                    user.Department,
                    user.CreatedAt,
                    user.AuthorizedFactoryIds,
                    AuthorizedFactoryIdList = (user.AuthorizedFactoryIds ?? string.Empty)
                        .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                        .Select(value => int.TryParse(value, out var id) ? id : 0)
                        .Where(id => id > 0)
                        .Distinct()
                        .ToList()
                })
                .ToList();
        }

        public object Create(UpsertUserDto dto)
        {
            var normalizedRole = NormalizeRole(dto.Role);
            var username = (dto.Username ?? string.Empty).Trim();
            var password = (dto.Password ?? string.Empty).Trim();

            if (string.IsNullOrWhiteSpace(username))
                throw new InvalidOperationException("Ten dang nhap khong duoc de trong.");

            if (string.IsNullOrWhiteSpace(password))
                throw new InvalidOperationException("Mat khau khong duoc de trong.");

            ValidatePasswordStrength(password);

            if (!IsValidRole(normalizedRole))
                throw new InvalidOperationException("Role khong hop le.");

            if (_context.Users.Any(user => user.Username.ToLower() == username.ToLower()))
                throw new InvalidOperationException("Ten dang nhap da ton tai.");

            var authorizedFactoryIds = NormalizeAuthorizedFactoryIds(normalizedRole, dto.AuthorizedFactoryIdList);

            var user = new User
            {
                Username = username,
                FullName = string.IsNullOrWhiteSpace(dto.FullName) ? null : dto.FullName.Trim(),
                Role = normalizedRole,
                Department = string.IsNullOrWhiteSpace(dto.Department) ? null : dto.Department.Trim(),
                AuthorizedFactoryIds = authorizedFactoryIds,
                CreatedAt = DateTime.UtcNow,
            };
            _passwordService.SetPassword(user, password);

            _context.Users.Add(user);
            _context.SaveChanges();

            return MapUserResponse(user);
        }

        public object Update(int id, UpsertUserDto dto)
        {
            var user = _context.Users.FirstOrDefault(item => item.Id == id);
            if (user == null)
                throw new InvalidOperationException("Khong tim thay user.");

            var normalizedRole = NormalizeRole(dto.Role);
            var username = (dto.Username ?? string.Empty).Trim();
            var password = (dto.Password ?? string.Empty).Trim();

            if (string.IsNullOrWhiteSpace(username))
                throw new InvalidOperationException("Ten dang nhap khong duoc de trong.");

            if (!IsValidRole(normalizedRole))
                throw new InvalidOperationException("Role khong hop le.");

            if (_context.Users.Any(item => item.Id != id && item.Username.ToLower() == username.ToLower()))
                throw new InvalidOperationException("Ten dang nhap da ton tai.");

            user.Username = username;
            user.FullName = string.IsNullOrWhiteSpace(dto.FullName) ? null : dto.FullName.Trim();
            user.Role = normalizedRole;
            user.Department = string.IsNullOrWhiteSpace(dto.Department) ? null : dto.Department.Trim();
            user.AuthorizedFactoryIds = NormalizeAuthorizedFactoryIds(normalizedRole, dto.AuthorizedFactoryIdList);

            if (!string.IsNullOrWhiteSpace(password))
            {
                ValidatePasswordStrength(password);
                _passwordService.SetPassword(user, password);
            }

            _context.SaveChanges();

            return MapUserResponse(user);
        }

        public void Delete(int id)
        {
            var user = _context.Users.FirstOrDefault(item => item.Id == id);
            if (user == null)
                throw new InvalidOperationException("Khong tim thay user.");

            _context.Users.Remove(user);
            _context.SaveChanges();
        }

        public object ResetPassword(int id, string? newPassword)
        {
            var user = _context.Users.FirstOrDefault(item => item.Id == id);
            if (user == null)
                throw new InvalidOperationException("Khong tim thay user.");

            var password = (newPassword ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(password))
                throw new InvalidOperationException("Mat khau moi khong duoc de trong.");

            ValidatePasswordStrength(password);
            _passwordService.SetPassword(user, password);
            _context.SaveChanges();

            return MapUserResponse(user);
        }

        public void ChangePassword(int id, string? currentPassword, string? newPassword)
        {
            var user = _context.Users.FirstOrDefault(item => item.Id == id);
            if (user == null)
                throw new InvalidOperationException("Khong tim thay user.");

            var normalizedCurrentPassword = (currentPassword ?? string.Empty).Trim();
            var normalizedNewPassword = (newPassword ?? string.Empty).Trim();

            if (string.IsNullOrWhiteSpace(normalizedCurrentPassword))
                throw new InvalidOperationException("Mat khau hien tai khong duoc de trong.");

            if (string.IsNullOrWhiteSpace(normalizedNewPassword))
                throw new InvalidOperationException("Mat khau moi khong duoc de trong.");

            if (_passwordService.Verify(user, normalizedCurrentPassword) == Microsoft.AspNetCore.Identity.PasswordVerificationResult.Failed)
                throw new InvalidOperationException("Mat khau hien tai khong dung.");

            ValidatePasswordStrength(normalizedNewPassword);
            _passwordService.SetPassword(user, normalizedNewPassword);
            _context.SaveChanges();
        }

        private static string NormalizeRole(string? role)
        {
            return (role ?? string.Empty).Trim().ToLower();
        }

        private static bool IsValidRole(string role)
        {
            return role == "admin" || role == "processor" || role == "user";
        }

        private static void ValidatePasswordStrength(string password)
        {
            if (password.Length < 8)
                throw new InvalidOperationException("Mat khau phai co it nhat 8 ky tu.");
        }

        private string? NormalizeAuthorizedFactoryIds(string role, List<int>? factoryIds)
        {
            if (role != "processor")
                return null;

            var normalizedFactoryIds = (factoryIds ?? new List<int>())
                .Where(id => id > 0)
                .Distinct()
                .ToList();

            if (!normalizedFactoryIds.Any())
                throw new InvalidOperationException("Processor phai duoc gan it nhat 1 nha may.");

            var validFactoryIds = _context.Factories
                .Where(factory => normalizedFactoryIds.Contains(factory.Id))
                .Select(factory => factory.Id)
                .ToList();

            if (validFactoryIds.Count != normalizedFactoryIds.Count)
                throw new InvalidOperationException("Danh sach nha may khong hop le.");

            return string.Join(",", validFactoryIds.OrderBy(id => id));
        }

        private static object MapUserResponse(User user)
        {
            var authorizedFactoryIdList = (user.AuthorizedFactoryIds ?? string.Empty)
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(value => int.TryParse(value, out var id) ? id : 0)
                .Where(id => id > 0)
                .Distinct()
                .ToList();

            return new
            {
                user.Id,
                user.Username,
                user.FullName,
                user.Role,
                user.Department,
                user.CreatedAt,
                user.AuthorizedFactoryIds,
                AuthorizedFactoryIdList = authorizedFactoryIdList
            };
        }
    }
}

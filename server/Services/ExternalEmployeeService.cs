using ITServiceDesk.Api.Data;
using ITServiceDesk.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace ITServiceDesk.Api.Services
{
    public class ExternalEmployeeService
    {
        private readonly AppDbContext _context;

        public ExternalEmployeeService(AppDbContext context)
        {
            _context = context;
        }

        public ExternalEmployeeRecord? GetEmployeeByCredentials(string username, string password)
        {
            var normalizedUsername = (username ?? string.Empty).Trim();
            var normalizedPassword = (password ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(normalizedUsername) || string.IsNullOrWhiteSpace(normalizedPassword))
                return null;

            return QueryEmployees(normalizedUsername, normalizedPassword).FirstOrDefault();
        }

        public List<ExternalEmployeeRecord> GetActiveEmployees()
        {
            return QueryEmployees();
        }

        public User EnsureLocalUserForEmployee(ExternalEmployeeRecord employee)
        {
            var normalizedUsername = employee.Username.Trim().ToLower();
            var user = _context.Users.FirstOrDefault(item => item.Username.ToLower() == normalizedUsername);

            if (user == null)
            {
                user = new User
                {
                    Username = employee.Username,
                    PasswordHash = employee.PasswordHash,
                    FullName = employee.FullName,
                    Department = employee.Department,
                    Role = MapRole(employee.RoleName, employee.Department),
                    AuthorizedFactoryIds = BuildAuthorizedFactoryIds(employee.RoleName, employee.Department),
                    CreatedAt = employee.CreatedAt ?? DateTime.UtcNow,
                };

                _context.Users.Add(user);
                _context.SaveChanges();
                return user;
            }

            var hasChanges = false;

            if (!string.Equals(user.FullName, employee.FullName, StringComparison.Ordinal))
            {
                user.FullName = employee.FullName;
                hasChanges = true;
            }

            if (!string.Equals(user.Department, employee.Department, StringComparison.Ordinal))
            {
                user.Department = employee.Department;
                hasChanges = true;
            }

            if (user.CreatedAt == default && employee.CreatedAt.HasValue)
            {
                user.CreatedAt = employee.CreatedAt.Value;
                hasChanges = true;
            }

            if (string.IsNullOrWhiteSpace(user.PasswordHash) && !string.IsNullOrWhiteSpace(employee.PasswordHash))
            {
                user.PasswordHash = employee.PasswordHash;
                hasChanges = true;
            }

            if (string.IsNullOrWhiteSpace(user.Role))
            {
                user.Role = MapRole(employee.RoleName, employee.Department);
                hasChanges = true;
            }

            if (string.IsNullOrWhiteSpace(user.AuthorizedFactoryIds))
            {
                var derivedFactoryIds = BuildAuthorizedFactoryIds(employee.RoleName, employee.Department);
                if (!string.IsNullOrWhiteSpace(derivedFactoryIds))
                {
                    user.AuthorizedFactoryIds = derivedFactoryIds;
                    hasChanges = true;
                }
            }

            if (hasChanges)
            {
                _context.SaveChanges();
            }

            return user;
        }

        public void SyncActiveEmployeesToLocalUsers()
        {
            var externalEmployees = GetActiveEmployees();
            if (!externalEmployees.Any())
                return;

            var localUsers = _context.Users.ToList();
            var localLookup = localUsers.ToDictionary(item => item.Username.Trim().ToLower(), item => item);
            var hasChanges = false;

            foreach (var employee in externalEmployees)
            {
                var normalizedUsername = employee.Username.Trim().ToLower();

                if (!localLookup.TryGetValue(normalizedUsername, out var user))
                {
                    user = new User
                    {
                        Username = employee.Username,
                        PasswordHash = employee.PasswordHash,
                        FullName = employee.FullName,
                        Department = employee.Department,
                        Role = MapRole(employee.RoleName, employee.Department),
                        AuthorizedFactoryIds = BuildAuthorizedFactoryIds(employee.RoleName, employee.Department),
                        CreatedAt = employee.CreatedAt ?? DateTime.UtcNow,
                    };

                    _context.Users.Add(user);
                    localLookup[normalizedUsername] = user;
                    hasChanges = true;
                    continue;
                }

                if (!string.Equals(user.FullName, employee.FullName, StringComparison.Ordinal))
                {
                    user.FullName = employee.FullName;
                    hasChanges = true;
                }

                if (!string.Equals(user.Department, employee.Department, StringComparison.Ordinal))
                {
                    user.Department = employee.Department;
                    hasChanges = true;
                }

                if (user.CreatedAt == default && employee.CreatedAt.HasValue)
                {
                    user.CreatedAt = employee.CreatedAt.Value;
                    hasChanges = true;
                }

                if (string.IsNullOrWhiteSpace(user.PasswordHash) && !string.IsNullOrWhiteSpace(employee.PasswordHash))
                {
                    user.PasswordHash = employee.PasswordHash;
                    hasChanges = true;
                }

                if (string.IsNullOrWhiteSpace(user.Role))
                {
                    user.Role = MapRole(employee.RoleName, employee.Department);
                    hasChanges = true;
                }

                if (string.IsNullOrWhiteSpace(user.AuthorizedFactoryIds))
                {
                    var derivedFactoryIds = BuildAuthorizedFactoryIds(employee.RoleName, employee.Department);
                    if (!string.IsNullOrWhiteSpace(derivedFactoryIds))
                    {
                        user.AuthorizedFactoryIds = derivedFactoryIds;
                        hasChanges = true;
                    }
                }
            }

            if (hasChanges)
            {
                _context.SaveChanges();
            }
        }

        private List<ExternalEmployeeRecord> QueryEmployees(string? username = null, string? password = null)
        {
            var connection = _context.Database.GetDbConnection();
            var shouldCloseConnection = connection.State != ConnectionState.Open;

            if (shouldCloseConnection)
            {
                connection.Open();
            }

            try
            {
                using var command = connection.CreateCommand();
                command.CommandText = @"
                    SELECT
                        tk.ID_TaiKhoan,
                        LTRIM(RTRIM(tk.TenTaiKhoan)) AS TenTaiKhoan,
                        LTRIM(RTRIM(tk.MatKhau)) AS MatKhau,
                        LTRIM(RTRIM(tk.HoVaTen)) AS HoVaTen,
                        CAST(tk.NgayTao AS datetime) AS NgayTao,
                        tk.ID_Quyen,
                        LTRIM(RTRIM(q.TenQuyen)) AS TenQuyen,
                        LTRIM(RTRIM(COALESCE(x.TenXuong, pb.TenPhongBan))) AS DonVi
                    FROM [Danhsach].[dbo].[Tbl_TaiKhoan] tk
                    LEFT JOIN [Danhsach].[dbo].[Tbl_Quyen] q ON q.ID_Quyen = tk.ID_Quyen
                    LEFT JOIN [Danhsach].[dbo].[Tbl_Xuong] x ON x.ID_Xuong = tk.ID_PhanXuong
                    LEFT JOIN [Danhsach].[dbo].[Tbl_PhongBan] pb ON pb.ID_PhongBan = tk.ID_PhanXuong
                    WHERE ISNULL(tk.ID_TrangThai, 1) = 1
                      AND (@username IS NULL OR LTRIM(RTRIM(tk.TenTaiKhoan)) = @username)
                      AND (@password IS NULL OR LTRIM(RTRIM(tk.MatKhau)) = @password)
                    ORDER BY tk.ID_TaiKhoan";

                var usernameParameter = command.CreateParameter();
                usernameParameter.ParameterName = "@username";
                usernameParameter.Value = string.IsNullOrWhiteSpace(username) ? DBNull.Value : username.Trim();
                command.Parameters.Add(usernameParameter);

                var passwordParameter = command.CreateParameter();
                passwordParameter.ParameterName = "@password";
                passwordParameter.Value = string.IsNullOrWhiteSpace(password) ? DBNull.Value : password.Trim();
                command.Parameters.Add(passwordParameter);

                var employees = new List<ExternalEmployeeRecord>();

                using var reader = command.ExecuteReader();
                while (reader.Read())
                {
                    employees.Add(new ExternalEmployeeRecord
                    {
                        ExternalId = reader["ID_TaiKhoan"] is int externalId ? externalId : 0,
                        Username = Convert.ToString(reader["TenTaiKhoan"])?.Trim() ?? string.Empty,
                        PasswordHash = Convert.ToString(reader["MatKhau"])?.Trim() ?? string.Empty,
                        FullName = Convert.ToString(reader["HoVaTen"])?.Trim(),
                        Department = Convert.ToString(reader["DonVi"])?.Trim(),
                        RoleId = reader["ID_Quyen"] is int roleId ? roleId : 0,
                        RoleName = Convert.ToString(reader["TenQuyen"])?.Trim(),
                        CreatedAt = reader["NgayTao"] is DateTime createdAt ? createdAt : null,
                    });
                }

                return employees;
            }
            finally
            {
                if (shouldCloseConnection)
                {
                    connection.Close();
                }
            }
        }

        private static string MapRole(string? roleName, string? department)
        {
            var normalizedRole = NormalizeText(roleName);
            if (normalizedRole == "admin")
                return "admin";

            if (normalizedRole == "nguoi dung")
                return "user";

            if (normalizedRole.Contains("xu ly") || ExtractFactoryIds(department).Count > 0)
                return "processor";

            return "user";
        }

        private static string? BuildAuthorizedFactoryIds(string? roleName, string? department)
        {
            if (MapRole(roleName, department) != "processor")
                return null;

            var factoryIds = ExtractFactoryIds(department);
            return factoryIds.Count > 0 ? string.Join(",", factoryIds.Distinct().OrderBy(id => id)) : null;
        }

        private static List<int> ExtractFactoryIds(string? department)
        {
            var normalizedDepartment = NormalizeText(department);
            var factoryIds = new List<int>();

            if (normalizedDepartment.Contains("luyen gang 1"))
                factoryIds.Add(1);
            if (normalizedDepartment.Contains("luyen gang 2"))
                factoryIds.Add(2);
            if (normalizedDepartment.Contains("nhiet dien 1"))
                factoryIds.Add(3);
            if (normalizedDepartment.Contains("nhiet dien 2"))
                factoryIds.Add(4);
            if (normalizedDepartment.Contains("nang luong"))
                factoryIds.Add(5);

            return factoryIds;
        }

        private static string NormalizeText(string? value)
        {
            return (value ?? string.Empty)
                .Normalize(System.Text.NormalizationForm.FormD)
                .Where(character => System.Globalization.CharUnicodeInfo.GetUnicodeCategory(character) != System.Globalization.UnicodeCategory.NonSpacingMark)
                .Aggregate(string.Empty, (current, character) => current + character)
                .Trim()
                .ToLowerInvariant();
        }
    }

    public class ExternalEmployeeRecord
    {
        public int ExternalId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? Department { get; set; }
        public int RoleId { get; set; }
        public string? RoleName { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}

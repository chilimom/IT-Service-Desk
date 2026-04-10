using ITServiceDesk.Api.Models;
using Microsoft.AspNetCore.Identity;

namespace ITServiceDesk.Api.Services
{
    public class PasswordService
    {
        private readonly PasswordHasher<User> _passwordHasher = new();

        public string HashPassword(User user, string password)
        {
            return _passwordHasher.HashPassword(user, password);
        }

        public PasswordVerificationResult Verify(User user, string providedPassword)
        {
            var storedPassword = user.PasswordHash ?? string.Empty;

            if (string.IsNullOrWhiteSpace(storedPassword) || string.IsNullOrWhiteSpace(providedPassword))
                return PasswordVerificationResult.Failed;

            return _passwordHasher.VerifyHashedPassword(user, storedPassword, providedPassword);
        }

        public void SetPassword(User user, string password)
        {
            user.PasswordHash = HashPassword(user, password.Trim());
        }

        public bool VerifyExternalPassword(string? storedHashedPassword, string externalPassword)
        {
            if (string.IsNullOrWhiteSpace(storedHashedPassword) || string.IsNullOrWhiteSpace(externalPassword))
                return false;

            var tempUser = new User();
            return _passwordHasher.VerifyHashedPassword(tempUser, storedHashedPassword, externalPassword.Trim()) != PasswordVerificationResult.Failed;
        }
    }
}

namespace ITServiceDesk.Api.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = "";
        public string PasswordHash { get; set; } = "";
        public string? FullName { get; set; }
        public string Role { get; set; } = "";
        public string? AuthorizedFactoryIds { get; set; }
        public string? Department { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

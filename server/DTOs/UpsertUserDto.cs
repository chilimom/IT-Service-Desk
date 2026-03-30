namespace ITServiceDesk.Api.DTOs
{
    public class UpsertUserDto
    {
        public string Username { get; set; } = "";
        public string? Password { get; set; }
        public string? FullName { get; set; }
        public string Role { get; set; } = "";
        public string? Department { get; set; }
        public List<int>? AuthorizedFactoryIdList { get; set; }
    }
}

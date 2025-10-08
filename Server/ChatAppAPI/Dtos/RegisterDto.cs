namespace ChatAppAPI.Dtos;

public class RegisterDto
{
    public string Email { get; set; } = null!;
    public string? Username { get; set; }
    public string? Password { get; set; }
}
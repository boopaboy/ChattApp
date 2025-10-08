namespace ChatAppAPI.Dtos;

public class AddMembersDto
{
    public string GroupId { get; set; } = null!;
    public List<string> UserNames { get; set; } = new List<string>();
    
}
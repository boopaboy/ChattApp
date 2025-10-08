namespace ChatAppAPI.Models;

public class GroupChat
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = null!;
    public ICollection<GroupMember> Members { get; set; } = new List<GroupMember>();

}
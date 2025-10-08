using System.ComponentModel.DataAnnotations.Schema;

namespace ChatAppAPI.Models;

public class GroupMember
{

    [ForeignKey(nameof(GroupChat))]
    public string GroupChatId { get; set; } = null!;
    public GroupChat GroupChat { get; set; } = null!;

    [ForeignKey(nameof(User))]
    public string UserId { get; set; } = null!;
    public User User { get; set; } = null!;

}
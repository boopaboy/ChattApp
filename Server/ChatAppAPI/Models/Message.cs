using MongoDB.Bson;

namespace ChatAppAPI.Models;
public class Message 
{
    public ObjectId Id { get; set; }
    public string GroupChatId { get; set; }  = null!;
    public string SenderId { get; set; } = null!;    
    public string SenderUsername { get; set; } = null!;
    public string? Text { get; set; } 
    public DateTime Timestamp { get; set; }
}
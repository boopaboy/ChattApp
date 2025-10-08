using ChatAppAPI.Contexts;
using ChatAppAPI.Models;
using ChatAppAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using MongoDB.Driver;

namespace ChatAppAPI.Hubs;


public class ChatHub : Hub
{
    private readonly UserContext _context;
    private readonly MongoProvider _mongoProvider;

    public ChatHub(MongoProvider mongoProvider, UserContext context)
    {
        _mongoProvider = mongoProvider;
        _context = context;
    }



    public async Task SendMessage(string user, string message)
    {
        var userId = _context.Users.FirstOrDefault(u => u.Username == user)?.Id;
        await Clients.Group("global").SendAsync("ReceiveMessage", user, message, userId, "global");
        if (userId == null) return;
        var mongoMsg = new Message
        {
            SenderId = userId,
            SenderUsername = user,
            GroupChatId = "global",
            Text = message,
            Timestamp = DateTime.UtcNow
        };
        await _mongoProvider.CreateMessageAsync(mongoMsg);
    }

    public async Task JoinGroup(string groupId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, groupId);
    }

    public async Task LeaveGroup(string groupId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupId);
    }
    public async Task SendMessageToGroup(string groupId, string user, string userId, string message)
    {
        await Clients.Group(groupId).SendAsync("ReceiveMessage", user, message, userId, groupId);
        var mongoMsg = new Message
        {
            SenderId = userId,
            SenderUsername = user,
            GroupChatId = groupId,
            Text = message,
            Timestamp = DateTime.UtcNow
        };
        await _mongoProvider.CreateMessageAsync(mongoMsg);
    }
}
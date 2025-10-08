using ChatAppAPI.Contexts;
using ChatAppAPI.Dtos;
using ChatAppAPI.Models;
using ChatAppAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration.UserSecrets;
namespace ChatAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize]
    public class GroupController(UserContext context, MongoProvider mongoProvider) : ControllerBase
    {
        private readonly UserContext _context = context;
        private readonly MongoProvider _mongoProvider = mongoProvider;
        

        [HttpGet]
        public async Task<IActionResult> GetGroupsByMember()
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
                return Unauthorized("not authenticated");
            var userId = _context.Users.FirstOrDefault(u => u.Username == username)?.Id;
            if (userId == null)
                return NotFound("User not found");

            var groups = await _context.GroupChats
                .Where(g => g.Members.Any(m => m.UserId == userId))
                .ToListAsync();
            return Ok(groups);
        }


        [HttpPost]
        public async Task<IActionResult> CreateGroup([FromBody] string groupName)
        {
            if (string.IsNullOrEmpty(groupName))
                return BadRequest("Group name is required");

            var newGroup = new GroupChat
            {
                Name = groupName
            };
            var result = await _context.GroupChats.AddAsync(newGroup);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == User.Identity.Name);
            if (user == null)
                return NotFound("User not found");

            _context.GroupMembers.Add(new GroupMember
            {
                GroupChatId = newGroup.Id,
                UserId = user.Id
            });
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Group created successfully", GroupId = newGroup.Id });
        }

        [HttpPost("add-members")]
        public async Task<IActionResult> AddMembersToGroup([FromBody] AddMembersDto dto)
        {
            var group = await _context.GroupChats.FirstOrDefaultAsync(g => g.Id == dto.GroupId);
            if (group == null)
                return NotFound("Group not found");

            foreach (var username in dto.UserNames)
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
                if (user != null && !group.Members.Any(m => m.UserId == user.Id))
          {
                    group.Members.Add(new GroupMember
                    {
                        UserId = user.Id,
                        GroupChatId = group.Id
                    });
                }
            }
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Members added successfully" });
        }

        [HttpGet("messages/{id}")]
        public async Task<IActionResult> GetGroupMessages(string id)
        {
            var messages = await _mongoProvider.GetMessagesByGroupIdAsync(id);
            return Ok(messages);
        }
    }
}
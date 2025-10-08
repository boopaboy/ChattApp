using Microsoft.EntityFrameworkCore;
using ChatAppAPI.Models;

namespace ChatAppAPI.Contexts
{
    public class UserContext : DbContext
    {
        public UserContext(DbContextOptions<UserContext> options)
            : base(options)
        {

        }

        public DbSet<User> Users { get; set; }
        public DbSet<GroupChat> GroupChats { get; set; }
        public DbSet<GroupMember> GroupMembers { get; set; }
        
           protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<GroupMember>()
                .HasKey(gm => new { gm.GroupChatId, gm.UserId });

            modelBuilder.Entity<GroupMember>()
                .HasOne(gm => gm.GroupChat)
                .WithMany(gc => gc.Members)
                .HasForeignKey(gm => gm.GroupChatId);

            modelBuilder.Entity<GroupMember>()
                .HasOne(gm => gm.User)
                .WithMany() 
                .HasForeignKey(gm => gm.UserId);
        }

    }
}
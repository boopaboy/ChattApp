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
            // Fix for SQLite string type issues
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(string))
                    {
                        // For SQLite, convert all string types to TEXT
                        if (property.GetColumnType() == null || 
                            property.GetColumnType().ToLower().Contains("varchar") ||
                            property.GetColumnType().ToLower().Contains("nvarchar"))
                        {
                            property.SetColumnType("TEXT");
                        }
                    }
                }
            }

            // Your relationship configurations
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

        // REMOVE this method if you're configuring SQLite via Dependency Injection
        // protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        //     => optionsBuilder.UseSqlite("Data Source=Users.db");
    }
}
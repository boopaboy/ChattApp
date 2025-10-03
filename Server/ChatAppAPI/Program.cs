using ChatAppAPI.Hubs;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddSignalR();
var app = builder.Build();
app.MapOpenApi();
//app.UseHttpsRedirection();
//app.UseAuthorization();
app.MapControllers();
app.UseCors(builder => builder.WithOrigins("http://localhost:3000")
                              .AllowAnyHeader()
                              .AllowAnyMethod()
                              .AllowCredentials()

                              );
app.MapHub<ChatHub>("/chatHub");
app.Run();

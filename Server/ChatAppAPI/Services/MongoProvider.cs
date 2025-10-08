using ChatAppAPI.Models;
using MongoDB.Driver;

namespace ChatAppAPI.Services;

public class MongoProvider
{
	private readonly IMongoDatabase _database;
	public MongoProvider(IConfiguration configuration)
	{
		var client = new MongoClient(configuration.GetConnectionString("MongoConnection"));
		_database = client.GetDatabase("ChatAppLogs");
	}
	public IMongoCollection<Message> Messages => _database.GetCollection<Message>("Global");
	public async Task CreateMessageAsync(Message message)
	{
		await Messages.InsertOneAsync(message);
	}
	public async Task<List<Message>> GetMessagesByGroupIdAsync(string groupId)
	{
		var filter = Builders<Message>.Filter.Eq(m => m.GroupChatId, groupId);
		return await Messages.Find(filter).ToListAsync();
	}
}
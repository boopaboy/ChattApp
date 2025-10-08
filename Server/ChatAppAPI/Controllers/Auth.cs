using ChatAppAPI.Contexts;
using ChatAppAPI.Dtos;
using Microsoft.AspNetCore.Mvc;
using BCrypt.Net;
using ChatAppAPI.Services;
using Microsoft.AspNetCore.Authentication.BearerToken;

namespace ChatAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController(UserContext context, JwtService jwtService) : ControllerBase
    {
        private readonly UserContext _context = context;
        private readonly JwtService _jwtService  = jwtService;

        [HttpPost("signup")]
        public IActionResult Signup([FromBody] RegisterDto user)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var checkExistingUser = _context.Users.FirstOrDefault(u => u.Email == user.Email);

            if (checkExistingUser != null)
            {
                return BadRequest("User with this email already exists.");
            }

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(user.Password);
            var newUser = new Models.User
            {
                Email = user.Email,
                Username = user.Username!,
                PasswordHash = hashedPassword
            };
            _context.Users.Add(newUser);
            _context.SaveChanges();

            return Ok(new { Message = "User registered successfully" });



        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto user)
        {
            if (string.IsNullOrEmpty(user.Username) || string.IsNullOrEmpty(user.Password))
            {
                return BadRequest("Username and password are required.");
            }
            var existingUser = _context.Users.FirstOrDefault(u => u.Username == user.Username);
            if (existingUser == null)
            {
                return Unauthorized("Invalid username or password.");
            }

            if (!BCrypt.Net.BCrypt.Verify(user.Password, existingUser.PasswordHash))
            {
                return Unauthorized("Invalid username or password.");
            }

            return Ok(new { Message = "Login successful", Token = _jwtService.GenerateToken(existingUser.Username, existingUser.Id) });





        }
    }


}
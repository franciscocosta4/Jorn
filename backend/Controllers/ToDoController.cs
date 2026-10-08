using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using backend.Data;
using backend.Entities;

namespace backend.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ToDoController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public ToDoController(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

    [Authorize]
    [HttpGet(Name = "GetToDos")]
    public async Task<ActionResult<IEnumerable<ToDo>>> GetToDos()
    {
        var todos = await _context.ToDos
            .Include(t => t.User)
            .ToListAsync();

        return Ok(todos);
    }
    
    [Authorize]
    [HttpPost(Name = "CreateTodo")]
    public async Task<ActionResult<ToDo>> CreateTodo(CreateToDoRequest request)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user is null)
        {
            return Unauthorized();
        }

        var todo = new ToDo
        {
            Name = request.Name.Trim(),
            Done = false,
            CreatedAt = DateTime.UtcNow,
            UserId = user.Id
        };

        _context.ToDos.Add(todo);

        await _context.SaveChangesAsync();

        // Devolve HTTP 201 Created
        return CreatedAtAction(
            nameof(GetToDos),
            null,
            todo
        );
    }
    }
    public sealed class CreateToDoRequest
    {
        public string Name { get; set; } = string.Empty;
    }

    }

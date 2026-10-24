using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using backend.Data;
using backend.Entities;
using backend.DTOs.ToDos;

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
        public async Task<ActionResult<IEnumerable<ToDoResponse>>> GetToDos()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user is null)
            {
                return Unauthorized();
            }
            var todos = await _context.ToDos
                .Where(todo => todo.UserId == user.Id)
                .Select(todo => new ToDoResponse
                {
                    UserId = todo.UserId,
                    Id = todo.Id,
                    Name = todo.Name,
                    Done = todo.Done
                })
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

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTodo(int id)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user is null)
            {
                return Unauthorized();
            }

            var todo = await _context.ToDos.FindAsync(id);
            if (todo is null)
            {
                return NotFound();
            }

            if (user.Id != todo.UserId)
            {
                return Unauthorized();
            }

            _context.ToDos.Remove(todo);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }


}

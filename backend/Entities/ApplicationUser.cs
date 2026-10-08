using Microsoft.AspNetCore.Identity;
namespace backend.Entities;

public class ApplicationUser : IdentityUser
{
    // podemos adicionar campos extra depois (o entitycore já tras campos na tabela AspNetUsers)


    // Relação inversa (1 user → muitos todos)
    public ICollection<ToDo> ToDos { get; set; } = new List<ToDo>();


}

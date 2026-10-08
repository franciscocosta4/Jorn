using System;
using Microsoft.EntityFrameworkCore;
namespace backend.Entities;

public class ToDo
{
    public int Id {get; set;}
    public string Name {get; set;}
    public bool Done {get; set;}
    public DateTime CreatedAt {get; set;}

    // Foreign key para o utilizador (AspNetUsers)
    public string UserId { get; set; }

    // Propriedade de navegação (many-to-one)
    public ApplicationUser User { get; set; }
    
}

using System;
using Microsoft.EntityFrameworkCore;
namespace backend.DTOs.ToDos;

public class ToDoResponse
{
    public string UserId { get; set; }
    public int Id {get; set;}
    public string Name {get; set;}
    public bool Done {get; set;}
    
}

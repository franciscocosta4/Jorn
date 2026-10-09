using System;
using Microsoft.EntityFrameworkCore;
namespace backend.DTOs.ToDos;

public class ToDoResponse
{
    public int Id {get; set;}
    public string Name {get; set;}
    public bool Done {get; set;}
    
}

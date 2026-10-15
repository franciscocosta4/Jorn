using System;
using Microsoft.EntityFrameworkCore;
namespace backend.DTOs.ToDos;

public sealed class CreateToDoRequest
{
    public string Name { get; set; } = string.Empty;
}
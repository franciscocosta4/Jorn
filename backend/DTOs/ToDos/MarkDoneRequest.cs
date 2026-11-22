using System;
using Microsoft.EntityFrameworkCore;
namespace backend.DTOs.ToDos;

public sealed class MarkDoneRequest
{
      public int Id {get; set;}
}
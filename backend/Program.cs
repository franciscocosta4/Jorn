var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Configura CORS.
builder.Services.AddCors(options =>
{
    // Cria uma política chamada "ReactPolicy".
    options.AddPolicy("ReactPolicy", policy =>
    {
        // Permite pedidos provenientes do React.
        policy.WithOrigins("http://localhost:3000")

              // Permite headers como Content-Type.
              .AllowAnyHeader()

              // Permite GET, POST, PUT, DELETE, etc.
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

// Activa a política CORS.
app.UseCors("ReactPolicy");

app.MapControllers();

app.Run();

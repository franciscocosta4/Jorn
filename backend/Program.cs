using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using backend.Data;

var builder = WebApplication.CreateBuilder(args);

// Adiciona os Controllers.
builder.Services.AddControllers();

// Obtém a connection string do appsettings.json.
var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection");

// Regista o ApplicationDbContext uma única vez.
// O Entity Framework Core irá utilizar PostgreSQL através do Npgsql.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// Configura o ASP.NET Core Identity.
//
// IdentityUser representa o utilizador padrão do Identity.
// ApplicationDbContext é responsável por guardar os dados do Identity
// no PostgreSQL.
builder.Services
    .AddIdentityApiEndpoints<IdentityUser>()
    .AddEntityFrameworkStores<ApplicationDbContext>();

// Adiciona os serviços de autorização.
builder.Services.AddAuthorization();

// Configura CORS.
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configuração específica para desenvolvimento.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// CORS deve ser executado antes dos endpoints.
app.UseCors("ReactPolicy");

// Autenticação.
app.UseAuthentication();

// Autorização.
app.UseAuthorization();

// Mapeia os Controllers.
app.MapControllers();

// Mapeia os endpoints do ASP.NET Core Identity.
// Isto cria endpoints como /register, /login, /refresh, etc.
app.MapIdentityApi<IdentityUser>();

app.Run();
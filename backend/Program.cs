using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
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

// Usa o cookie do Identity como scheme de autenticação por omissão.
//
// Sem isto, o [Authorize] / RequireAuthorization só valida bearer tokens
// e ignora o cookie emitido pelo /login?useCookies=true,
// o que faria /api/users/me devolver sempre 401.
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.SameSite = SameSiteMode.Lax;

    // Sem isto, pedidos não autenticados são redirecionados (302)
    // para /Account/Login, que não existe numa API,
    // resultando em 404 em vez de 401.
    //
    // O frontend espera 401 para detectar "não autenticado".
    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        return Task.CompletedTask;
    };
});

builder.Services.AddAuthentication(IdentityConstants.ApplicationScheme);

// Adiciona os serviços de autorização.
builder.Services.AddAuthorization();

// Configura CORS.
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
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

// Devolve o utilizador actualmente autenticado via cookie.
app.MapGet("/api/users/me", (ClaimsPrincipal user) =>
    Results.Ok(new { email = user.Identity?.Name }))
    .RequireAuthorization();

// Termina a sessão limpando o cookie de autenticação.
app.MapPost("/api/auth/logout", async (HttpContext context) =>
{
    await context.SignOutAsync(IdentityConstants.ApplicationScheme);
    return Results.Ok();
});

app.Run();
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Cinema.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace Cinema.Api.Services;

public class TokenService(IConfiguration configuracao)
{
    public string Gerar(Usuario usuario)
    {
        var chave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuracao["Jwt:Chave"]!));
        var credenciais = new SigningCredentials(chave, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim("id", usuario.Id.ToString()),
            new Claim("nome", usuario.Nome),
            new Claim("email", usuario.Email)
        };
        var token = new JwtSecurityToken(claims: claims, expires: DateTime.UtcNow.AddHours(8), signingCredentials: credenciais);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

using Cinema.Api.Data;
using Cinema.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cinema.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/admin")]
public class AdminController(CinemaContext db, IConfiguration configuracao) : ControllerBase
{
    [HttpGet("resumo")]
    public async Task<IActionResult> Resumo()
    {
        if (!int.TryParse(User.FindFirst("id")?.Value, out var usuarioId))
            return Unauthorized(new { erro = "Faça login para acessar a dashboard." });

        var email = await db.Usuarios.AsNoTracking()
            .Where(u => u.Id == usuarioId)
            .Select(u => u.Email)
            .FirstOrDefaultAsync();

        if (email is null)
            return Unauthorized(new { erro = "Usuário não encontrado." });

        if (!AdminAccess.Permitido(email, configuracao))
            return StatusCode(403, new { erro = "Acesso restrito ao administrador do Cine Aura." });

        var usuarios = await db.Usuarios.AsNoTracking().CountAsync();
        var filmes = await db.Filmes.AsNoTracking().CountAsync(f => f.EmCartaz);
        var pedidos = await db.Pedidos.AsNoTracking().CountAsync();
        var ingressos = await db.Ingressos.AsNoTracking().CountAsync();
        var faturamento = await db.Pedidos.AsNoTracking()
            .SumAsync(p => (decimal?)p.Total) ?? 0m;

        var maisVendidos = await (
            from ingresso in db.Ingressos.AsNoTracking()
            join sessao in db.Sessoes.AsNoTracking() on ingresso.SessaoId equals sessao.Id
            join filme in db.Filmes.AsNoTracking() on sessao.FilmeId equals filme.Id
            group new { sessao, filme } by new { filme.Id, filme.Titulo } into grupo
            orderby grupo.Count() descending
            select new
            {
                filme = grupo.Key.Titulo,
                ingressos = grupo.Count(),
                faturamento = grupo.Sum(x => x.sessao.Preco)
            }
        ).Take(6).ToListAsync();

        var ultimosPedidos = await db.Pedidos.AsNoTracking()
            .OrderByDescending(p => p.CriadoEm)
            .ThenByDescending(p => p.Id)
            .Take(8)
            .Select(p => new
            {
                p.Codigo,
                filme = p.Sessao.Filme.Titulo,
                p.CriadoEm,
                p.Total,
                ingressos = p.Ingressos.Count
            })
            .ToListAsync();

        return Ok(new
        {
            atualizadoEm = DateTime.UtcNow,
            indicadores = new { usuarios, filmes, pedidos, ingressos, faturamento },
            maisVendidos,
            ultimosPedidos
        });
    }
}

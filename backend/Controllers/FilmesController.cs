using Cinema.Api.Data;
using Cinema.Api.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cinema.Api.Controllers;

[ApiController]
[Route("api/filmes")]
public class FilmesController(CinemaContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] string? genero)
    {
        var consulta = db.Filmes.AsNoTracking().Where(f => f.EmCartaz);

        if (!string.IsNullOrWhiteSpace(genero))
            consulta = consulta.Where(f => f.Genero == genero);

        return Ok(await consulta.OrderByDescending(f => f.Nota).ToListAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Obter(int id)
    {
        var filme = await db.Filmes.AsNoTracking().FirstOrDefaultAsync(f => f.Id == id);
        return filme is null ? NotFound(new { erro = "Filme não encontrado." }) : Ok(filme);
    }

    [HttpGet("{id:int}/sessoes")]
    public async Task<IActionResult> Sessoes(int id)
    {
        var agora = DateTime.Now;

        var sessoes = await db.Sessoes
            .AsNoTracking()
            .Where(s => s.FilmeId == id && s.Inicio > agora)
            .OrderBy(s => s.Inicio)
            .Select(s => new SessaoResumo(s.Id, s.Inicio, s.Preco, s.Formato, s.Sala.Nome))
            .ToListAsync();

        return Ok(sessoes);
    }
}

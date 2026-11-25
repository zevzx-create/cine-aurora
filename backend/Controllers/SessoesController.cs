using Cinema.Api.Data;
using Cinema.Api.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cinema.Api.Controllers;

[ApiController]
[Route("api/sessoes")]
public class SessoesController(CinemaContext db) : ControllerBase
{
    [HttpGet("{id:int}")]
    public async Task<IActionResult> Obter(int id)
    {
        var sessao = await db.Sessoes
            .AsNoTracking()
            .Include(s => s.Filme)
            .Include(s => s.Sala)
            .FirstOrDefaultAsync(s => s.Id == id && s.Filme.EmCartaz);

        if (sessao is null)
            return NotFound(new { erro = "Sessão não encontrada." });

        var ocupados = await db.Ingressos
            .AsNoTracking()
            .Where(i => i.SessaoId == id)
            .Select(i => new { i.Fileira, i.Numero })
            .ToListAsync();

        var filme = new FilmeResumo(sessao.Filme.Id, sessao.Filme.Titulo, sessao.Filme.Genero, sessao.Filme.DuracaoMin,
            sessao.Filme.Classificacao, sessao.Filme.CorPrimaria, sessao.Filme.CorSecundaria);

        var detalhe = new SessaoDetalhe(sessao.Id, sessao.Inicio, sessao.Preco, sessao.Formato, sessao.Sala.Nome,
            sessao.Sala.Fileiras, sessao.Sala.Colunas, filme, ocupados.Select(o => $"{o.Fileira}{o.Numero}").ToList());

        return Ok(detalhe);
    }
}

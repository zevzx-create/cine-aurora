using Cinema.Api.Data;
using Cinema.Api.Dtos;
using Cinema.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cinema.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/pedidos")]
public class PedidosController(CinemaContext db) : ControllerBase
{
    private int UsuarioId => int.Parse(User.FindFirst("id")!.Value);

    [HttpPost]
    public async Task<IActionResult> Criar(NovoPedido dados)
    {
        if (dados.Assentos is null || dados.Assentos.Count == 0)
            return BadRequest(new { erro = "Escolha pelo menos um assento." });

        if (dados.Assentos.Count > 8)
            return BadRequest(new { erro = "O limite é de 8 ingressos por compra." });

        var sessao = await db.Sessoes
            .Include(s => s.Filme)
            .Include(s => s.Sala)
            .FirstOrDefaultAsync(s => s.Id == dados.SessaoId);

        if (sessao is null)
            return NotFound(new { erro = "Sessão não encontrada." });

        if (!sessao.Filme.EmCartaz)
            return BadRequest(new { erro = "Este filme não está disponível para compra." });

        if (sessao.Inicio <= DateTime.UtcNow.AddHours(-3))
            return BadRequest(new { erro = "Essa sessão já começou." });

        var escolhidos = new List<(string Fileira, int Numero)>();

        foreach (var assento in dados.Assentos)
        {
            var fileira = (assento.Fileira ?? "").Trim().ToUpperInvariant();
            var indice = fileira.Length == 1 ? fileira[0] - 'A' : -1;

            if (indice < 0 || indice >= sessao.Sala.Fileiras || assento.Numero < 1 || assento.Numero > sessao.Sala.Colunas)
                return BadRequest(new { erro = "Assento inválido para esta sala." });

            escolhidos.Add((fileira, assento.Numero));
        }

        if (escolhidos.Distinct().Count() != escolhidos.Count)
            return BadRequest(new { erro = "Há assentos repetidos no pedido." });

        var ocupados = await db.Ingressos
            .Where(i => i.SessaoId == sessao.Id)
            .Select(i => new { i.Fileira, i.Numero })
            .ToListAsync();

        if (escolhidos.Any(e => ocupados.Any(o => o.Fileira == e.Fileira && o.Numero == e.Numero)))
            return Conflict(new { erro = "Algum dos assentos acabou de ser ocupado. Escolha outros." });

        var pedido = new Pedido
        {
            Codigo = Guid.NewGuid().ToString("N")[..10].ToUpperInvariant(),
            UsuarioId = UsuarioId,
            Sessao = sessao,
            Total = sessao.Preco * escolhidos.Count,
            CriadoEm = DateTime.Now,
            Ingressos = escolhidos.Select(e => new Ingresso { SessaoId = sessao.Id, Fileira = e.Fileira, Numero = e.Numero }).ToList()
        };

        db.Pedidos.Add(pedido);

        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Conflict(new { erro = "Algum dos assentos acabou de ser ocupado. Escolha outros." });
        }

        return Ok(Mapear(pedido));
    }

    [HttpGet("meus")]
    public async Task<IActionResult> Meus()
    {
        var usuarioId = UsuarioId;

        var pedidos = await db.Pedidos
            .AsNoTracking()
            .Include(p => p.Ingressos)
            .Include(p => p.Sessao).ThenInclude(s => s.Filme)
            .Include(p => p.Sessao).ThenInclude(s => s.Sala)
            .Where(p => p.UsuarioId == usuarioId)
            .OrderByDescending(p => p.CriadoEm)
            .ToListAsync();

        return Ok(pedidos.Select(Mapear));
    }

    private static PedidoResposta Mapear(Pedido p) => new(
        p.Id,
        p.Codigo,
        p.Total,
        p.CriadoEm,
        p.Sessao.Filme.Titulo,
        p.Sessao.Filme.CorPrimaria,
        p.Sessao.Filme.CorSecundaria,
        p.Sessao.Sala.Nome,
        p.Sessao.Formato,
        p.Sessao.Inicio,
        p.Ingressos.OrderBy(i => i.Fileira).ThenBy(i => i.Numero).Select(i => $"{i.Fileira}{i.Numero}").ToList());
}

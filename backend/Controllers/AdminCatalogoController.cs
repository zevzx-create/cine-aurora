using System.Globalization;
using System.Text.RegularExpressions;
using Cinema.Api.Data;
using Cinema.Api.Models;
using Cinema.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cinema.Api.Controllers;

public record FilmeEdicao(
    string Titulo, string Sinopse, string Genero, int DuracaoMin,
    string Classificacao, decimal Nota, int Ano,
    string CorPrimaria, string CorSecundaria, string? PosterUrl,
    string? BannerUrl, bool EmCartaz);

public record SessaoEdicao(int FilmeId, int SalaId, string Inicio, decimal Preco, string Formato);

[ApiController]
[Authorize]
[Route("api/admin")]
public class AdminCatalogoController(CinemaContext db, IConfiguration configuracao) : ControllerBase
{
    private async Task<bool> Autorizado()
    {
        if (!int.TryParse(User.FindFirst("id")?.Value, out var usuarioId)) return false;

        var email = await db.Usuarios.AsNoTracking()
            .Where(u => u.Id == usuarioId)
            .Select(u => u.Email)
            .FirstOrDefaultAsync();

        return AdminAccess.Permitido(email, configuracao);
    }

    private IActionResult AcessoNegado() => StatusCode(403, new { erro = "Acesso exclusivo ao administrador." });

    private static string? ValidarFilme(FilmeEdicao dados)
    {
        if (string.IsNullOrWhiteSpace(dados.Titulo) || dados.Titulo.Trim().Length > 140)
            return "O título deve ter entre 1 e 140 caracteres.";
        if (string.IsNullOrWhiteSpace(dados.Sinopse) || dados.Sinopse.Trim().Length > 5000)
            return "A sinopse deve ter entre 1 e 5000 caracteres.";
        if (string.IsNullOrWhiteSpace(dados.Genero) || dados.Genero.Trim().Length > 40)
            return "Informe um gênero com no máximo 40 caracteres.";
        if (dados.DuracaoMin < 0 || dados.DuracaoMin > 600)
            return "A duração deve estar entre 0 e 600 minutos.";
        if (!new[] { "L", "10", "12", "14", "16", "18", "A" }.Contains(dados.Classificacao?.Trim().ToUpperInvariant()))
            return "Classificação inválida. Use L, 10, 12, 14, 16, 18 ou A.";
        if (dados.Nota < 0 || dados.Nota > 10)
            return "A nota deve estar entre 0 e 10.";
        if (dados.Ano < 1900 || dados.Ano > 2100)
            return "O ano deve estar entre 1900 e 2100.";
        if (!CorValida(dados.CorPrimaria) || !CorValida(dados.CorSecundaria))
            return "As cores precisam usar o formato hexadecimal #RRGGBB.";
        if (!UrlValida(dados.PosterUrl) || !UrlValida(dados.BannerUrl))
            return "Os links das imagens devem ser URLs HTTP/HTTPS com até 500 caracteres.";
        return null;
    }

    private static bool CorValida(string? valor) =>
        valor is not null && Regex.IsMatch(valor, "^#[0-9a-fA-F]{6}$");

    private static bool UrlValida(string? valor) =>
        string.IsNullOrWhiteSpace(valor) ||
        (valor.Trim().Length <= 500 && Uri.TryCreate(valor.Trim(), UriKind.Absolute, out var uri) &&
         (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps));

    private static void AplicarFilme(Filme filme, FilmeEdicao dados)
    {
        filme.Titulo = dados.Titulo.Trim();
        filme.Sinopse = dados.Sinopse.Trim();
        filme.Genero = dados.Genero.Trim();
        filme.DuracaoMin = dados.DuracaoMin;
        filme.Classificacao = dados.Classificacao.Trim().ToUpperInvariant();
        filme.Nota = Math.Round(dados.Nota, 1);
        filme.Ano = dados.Ano;
        filme.CorPrimaria = dados.CorPrimaria.Trim();
        filme.CorSecundaria = dados.CorSecundaria.Trim();
        filme.PosterUrl = string.IsNullOrWhiteSpace(dados.PosterUrl) ? null : dados.PosterUrl.Trim();
        filme.BannerUrl = string.IsNullOrWhiteSpace(dados.BannerUrl) ? null : dados.BannerUrl.Trim();
        filme.EmCartaz = dados.EmCartaz;
    }

    [HttpGet("filmes")]
    public async Task<IActionResult> Filmes()
    {
        if (!await Autorizado()) return AcessoNegado();
        return Ok(await db.Filmes.AsNoTracking()
            .OrderByDescending(f => f.EmCartaz)
            .ThenByDescending(f => f.Id)
            .ToListAsync());
    }

    [HttpPost("filmes")]
    public async Task<IActionResult> CriarFilme([FromBody] FilmeEdicao dados)
    {
        if (!await Autorizado()) return AcessoNegado();
        var erro = ValidarFilme(dados);
        if (erro is not null) return BadRequest(new { erro });

        if (await db.Filmes.AnyAsync(f => f.Titulo == dados.Titulo.Trim()))
            return Conflict(new { erro = "Já existe um filme com esse título." });

        var filme = new Filme();
        AplicarFilme(filme, dados);
        db.Filmes.Add(filme);
        await db.SaveChangesAsync();
        return Created($"/api/filmes/{filme.Id}", filme);
    }

    [HttpPut("filmes/{id:int}")]
    public async Task<IActionResult> EditarFilme(int id, [FromBody] FilmeEdicao dados)
    {
        if (!await Autorizado()) return AcessoNegado();
        var erro = ValidarFilme(dados);
        if (erro is not null) return BadRequest(new { erro });

        var filme = await db.Filmes.FindAsync(id);
        if (filme is null) return NotFound(new { erro = "Filme não encontrado." });

        if (await db.Filmes.AnyAsync(f => f.Id != id && f.Titulo == dados.Titulo.Trim()))
            return Conflict(new { erro = "Já existe outro filme com esse título." });

        AplicarFilme(filme, dados);
        await db.SaveChangesAsync();
        return Ok(filme);
    }

    [HttpDelete("filmes/{id:int}")]
    public async Task<IActionResult> RemoverFilme(int id)
    {
        if (!await Autorizado()) return AcessoNegado();
        var filme = await db.Filmes.FindAsync(id);
        if (filme is null) return NotFound(new { erro = "Filme não encontrado." });

        // Exclusão lógica: pedidos/ingressos históricos e suas relações não são apagados.
        filme.EmCartaz = false;
        await db.SaveChangesAsync();
        return Ok(new { mensagem = "Filme retirado do catálogo. O histórico foi preservado.", filme.Id });
    }

    [HttpGet("salas")]
    public async Task<IActionResult> Salas()
    {
        if (!await Autorizado()) return AcessoNegado();
        return Ok(await db.Salas.AsNoTracking().OrderBy(s => s.Id)
            .Select(s => new { s.Id, s.Nome, s.Fileiras, s.Colunas })
            .ToListAsync());
    }

    [HttpGet("sessoes")]
    public async Task<IActionResult> Sessoes([FromQuery] int? filmeId)
    {
        if (!await Autorizado()) return AcessoNegado();
        var consulta = db.Sessoes.AsNoTracking().AsQueryable();
        if (filmeId.HasValue) consulta = consulta.Where(s => s.FilmeId == filmeId.Value);

        return Ok(await consulta
            .OrderByDescending(s => s.Inicio)
            .ThenByDescending(s => s.Id)
            .Take(300)
            .Select(s => new
            {
                s.Id, s.FilmeId, filme = s.Filme.Titulo,
                s.SalaId, sala = s.Sala.Nome,
                s.Inicio, s.Preco, s.Formato,
                reservas = s.Pedidos.Count
            })
            .ToListAsync());
    }

    private static string? ValidarSessao(SessaoEdicao dados, out DateTime inicio)
    {
        var valida = DateTime.TryParseExact(dados.Inicio,
            new[] { "yyyy-MM-ddTHH:mm", "yyyy-MM-ddTHH:mm:ss" },
            CultureInfo.InvariantCulture, DateTimeStyles.None, out inicio);

        if (!valida || inicio.Year < 2020 || inicio.Year > 2100)
            return "Informe a data e o horário no formato AAAA-MM-DDTHH:MM.";
        if (dados.Preco <= 0 || dados.Preco > 9999)
            return "O preço deve ser maior que zero e até R$ 9.999,00.";
        if (!new[] { "2D", "3D", "IMAX", "VIP" }.Contains(dados.Formato?.Trim().ToUpperInvariant()))
            return "O formato deve ser 2D, 3D, IMAX ou VIP.";
        return null;
    }

    private async Task<string?> ValidarDisponibilidade(SessaoEdicao dados, DateTime inicio, int? ignorarId = null)
    {
        var filme = await db.Filmes.AsNoTracking().FirstOrDefaultAsync(f => f.Id == dados.FilmeId);
        if (filme is null || !filme.EmCartaz) return "Selecione um filme em cartaz.";
        if (!await db.Salas.AnyAsync(s => s.Id == dados.SalaId))
            return "Selecione uma sala válida.";

        if (await db.Sessoes.AnyAsync(s => s.SalaId == dados.SalaId && s.Inicio == inicio &&
                                             (!ignorarId.HasValue || s.Id != ignorarId.Value)))
            return "Essa sala já tem uma sessão cadastrada no mesmo horário.";

        return null;
    }

    [HttpPost("sessoes")]
    public async Task<IActionResult> CriarSessao([FromBody] SessaoEdicao dados)
    {
        if (!await Autorizado()) return AcessoNegado();
        var erro = ValidarSessao(dados, out var inicio);
        if (erro is not null) return BadRequest(new { erro });
        if (inicio <= DateTime.UtcNow.AddHours(-3))
            return BadRequest(new { erro = "Escolha uma data e hora futura (horário de Brasília)." });
        erro = await ValidarDisponibilidade(dados, inicio);
        if (erro is not null) return Conflict(new { erro });

        var sessao = new Sessao
        {
            FilmeId = dados.FilmeId, SalaId = dados.SalaId,
            Inicio = inicio, Preco = dados.Preco,
            Formato = dados.Formato.Trim().ToUpperInvariant()
        };
        db.Sessoes.Add(sessao);
        await db.SaveChangesAsync();
        return Ok(new { sessao.Id, sessao.FilmeId, sessao.SalaId, sessao.Inicio, sessao.Preco, sessao.Formato });
    }

    [HttpPut("sessoes/{id:int}")]
    public async Task<IActionResult> EditarSessao(int id, [FromBody] SessaoEdicao dados)
    {
        if (!await Autorizado()) return AcessoNegado();
        var erro = ValidarSessao(dados, out var inicio);
        if (erro is not null) return BadRequest(new { erro });
        if (inicio <= DateTime.UtcNow.AddHours(-3))
            return BadRequest(new { erro = "Escolha uma data e hora futura (horário de Brasília)." });

        var sessao = await db.Sessoes.FindAsync(id);
        if (sessao is null) return NotFound(new { erro = "Sessão não encontrada." });
        if (await db.Pedidos.AnyAsync(p => p.SessaoId == id))
            return Conflict(new { erro = "Essa sessão já possui pedidos. Não é permitido alterar horário, sala ou preço de ingressos vendidos." });

        erro = await ValidarDisponibilidade(dados, inicio, id);
        if (erro is not null) return Conflict(new { erro });

        sessao.FilmeId = dados.FilmeId;
        sessao.SalaId = dados.SalaId;
        sessao.Inicio = inicio;
        sessao.Preco = dados.Preco;
        sessao.Formato = dados.Formato.Trim().ToUpperInvariant();
        await db.SaveChangesAsync();
        return Ok(new { sessao.Id, sessao.FilmeId, sessao.SalaId, sessao.Inicio, sessao.Preco, sessao.Formato });
    }

    [HttpDelete("sessoes/{id:int}")]
    public async Task<IActionResult> RemoverSessao(int id)
    {
        if (!await Autorizado()) return AcessoNegado();
        var sessao = await db.Sessoes.FindAsync(id);
        if (sessao is null) return NotFound(new { erro = "Sessão não encontrada." });

        if (await db.Pedidos.AnyAsync(p => p.SessaoId == id))
            return Conflict(new { erro = "Esta sessão possui pedidos e não pode ser excluída." });

        db.Sessoes.Remove(sessao);
        await db.SaveChangesAsync();
        return Ok(new { mensagem = "Sessão excluída do MySQL.", id });
    }
}

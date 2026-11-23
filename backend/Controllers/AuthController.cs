using Cinema.Api.Data;
using Cinema.Api.Dtos;
using Cinema.Api.Models;
using Cinema.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cinema.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(CinemaContext db, TokenService tokens, IConfiguration configuracao, ILogger<AuthController> logger) : ControllerBase
{
    [HttpPost("registrar")]
    public async Task<IActionResult> Registrar(Registro dados)
    {
        if (string.IsNullOrWhiteSpace(dados.Nome) || string.IsNullOrWhiteSpace(dados.Email) || string.IsNullOrWhiteSpace(dados.Senha))
            return BadRequest(new { erro = "Preencha todos os campos." });

        if (!dados.Email.Contains('@'))
            return BadRequest(new { erro = "Informe um e-mail válido." });

        if (dados.Senha.Length < 6)
            return BadRequest(new { erro = "A senha precisa ter pelo menos 6 caracteres." });

        var email = dados.Email.Trim().ToLowerInvariant();

        if (await db.Usuarios.AnyAsync(u => u.Email == email))
            return Conflict(new { erro = "Já existe uma conta com esse e-mail." });

        var usuario = new Usuario
        {
            Nome = dados.Nome.Trim(),
            Email = email,
            SenhaHash = BCrypt.Net.BCrypt.HashPassword(dados.Senha),
            CriadoEm = DateTime.Now
        };

        db.Usuarios.Add(usuario);
        await db.SaveChangesAsync();

        return Ok(Resposta(usuario));
    }

    [HttpPost("entrar")]
    public async Task<IActionResult> Entrar(Credenciais dados)
    {
        var email = (dados.Email ?? "").Trim().ToLowerInvariant();
        var usuario = await db.Usuarios.FirstOrDefaultAsync(u => u.Email == email);

        if (usuario is null || !BCrypt.Net.BCrypt.Verify(dados.Senha ?? "", usuario.SenhaHash))
            return Unauthorized(new { erro = "E-mail ou senha incorretos." });

        return Ok(Resposta(usuario));
    }

    [Authorize]
    [HttpDelete("conta")]
    [HttpPost("excluir-conta")]
    public async Task<IActionResult> ExcluirConta(ExcluirContaDados dados)
    {
        var identificador = User.FindFirst("id")?.Value;
        if (!int.TryParse(identificador, out var usuarioId))
            return Unauthorized(new { erro = "Sessão inválida. Entre novamente." });

        if (string.IsNullOrWhiteSpace(dados.Senha))
            return BadRequest(new { erro = "Informe sua senha para excluir a conta." });

        var usuario = await db.Usuarios.FirstOrDefaultAsync(u => u.Id == usuarioId);
        if (usuario is null)
            return Unauthorized(new { erro = "Conta não encontrada. Entre novamente." });

        if (!BCrypt.Net.BCrypt.Verify(dados.Senha, usuario.SenhaHash))
            return BadRequest(new { erro = "Senha incorreta. Sua conta não foi excluída." });

        await using var transacao = await db.Database.BeginTransactionAsync();
        try
        {
            await db.Database.ExecuteSqlInterpolatedAsync(
                $"DELETE FROM ingressos WHERE pedido_id IN (SELECT id FROM pedidos WHERE usuario_id = {usuarioId})");
            await db.Database.ExecuteSqlInterpolatedAsync(
                $"DELETE FROM pedidos WHERE usuario_id = {usuarioId}");
            await db.Database.ExecuteSqlInterpolatedAsync(
                $"DELETE FROM usuarios WHERE id = {usuarioId}");

            await transacao.CommitAsync();
            return Ok(new { mensagem = "Conta excluída com sucesso." });
        }
        catch (Exception ex)
        {
            await transacao.RollbackAsync();
            logger.LogError(ex, "Falha ao excluir conta: {UsuarioId}", usuarioId);
            return StatusCode(500, new { erro = "Não foi possível excluir sua conta. Consulte os logs no Railway." });
        }
    }

    private AuthResposta Resposta(Usuario usuario) =>
        new(tokens.Gerar(usuario), new UsuarioDto(usuario.Id, usuario.Nome, usuario.Email, AdminAccess.Permitido(usuario.Email, configuracao)));
}

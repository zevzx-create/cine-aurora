namespace Cinema.Api.Dtos;

public record Registro(string Nome, string Email, string Senha);
public record Credenciais(string Email, string Senha);
public record ExcluirContaDados(string Senha);
public record UsuarioDto(int Id, string Nome, string Email, bool IsAdmin);
public record AuthResposta(string Token, UsuarioDto Usuario);

public record SessaoResumo(int Id, DateTime Inicio, decimal Preco, string Formato, string Sala);
public record FilmeResumo(int Id, string Titulo, string Genero, int DuracaoMin, string Classificacao, string CorPrimaria, string CorSecundaria);
public record SessaoDetalhe(int Id, DateTime Inicio, decimal Preco, string Formato, string Sala, int Fileiras, int Colunas, FilmeResumo Filme, List<string> Ocupados);

public record AssentoPedido(string Fileira, int Numero);
public record NovoPedido(int SessaoId, List<AssentoPedido> Assentos);
public record PedidoResposta(int Id, string Codigo, decimal Total, DateTime CriadoEm, string Filme, string CorPrimaria, string CorSecundaria, string Sala, string Formato, DateTime Inicio, List<string> Assentos);

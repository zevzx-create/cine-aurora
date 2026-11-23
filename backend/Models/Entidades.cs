using System.Text.Json.Serialization;

namespace Cinema.Api.Models;

public class Usuario
{
    public int Id { get; set; }
    public string Nome { get; set; } = "";
    public string Email { get; set; } = "";
    public string SenhaHash { get; set; } = "";
    public DateTime CriadoEm { get; set; }
    [JsonIgnore] public List<Pedido> Pedidos { get; set; } = new();
}

public class Filme
{
    public int Id { get; set; }
    public string Titulo { get; set; } = "";
    public string Sinopse { get; set; } = "";
    public string Genero { get; set; } = "";
    public int DuracaoMin { get; set; }
    public string Classificacao { get; set; } = "";
    public decimal Nota { get; set; }
    public int Ano { get; set; }
    public string CorPrimaria { get; set; } = "";
    public string CorSecundaria { get; set; } = "";
    public bool EmCartaz { get; set; }
    public string? PosterUrl { get; set; }
    public string? BannerUrl { get; set; }
    [JsonIgnore] public List<Sessao> Sessoes { get; set; } = new();
}

public class Sala
{
    public int Id { get; set; }
    public string Nome { get; set; } = "";
    public int Fileiras { get; set; }
    public int Colunas { get; set; }
    [JsonIgnore] public List<Sessao> Sessoes { get; set; } = new();
}

public class Sessao
{
    public int Id { get; set; }
    public int FilmeId { get; set; }
    public int SalaId { get; set; }
    public DateTime Inicio { get; set; }
    public decimal Preco { get; set; }
    public string Formato { get; set; } = "";
    public Filme Filme { get; set; } = null!;
    public Sala Sala { get; set; } = null!;
    public List<Pedido> Pedidos { get; set; } = new();
}

public class Pedido
{
    public int Id { get; set; }
    public string Codigo { get; set; } = "";
    public int UsuarioId { get; set; }
    public int SessaoId { get; set; }
    public decimal Total { get; set; }
    public DateTime CriadoEm { get; set; }
    public Usuario Usuario { get; set; } = null!;
    public Sessao Sessao { get; set; } = null!;
    public List<Ingresso> Ingressos { get; set; } = new();
}

public class Ingresso
{
    public int Id { get; set; }
    public int PedidoId { get; set; }
    public int SessaoId { get; set; }
    public string Fileira { get; set; } = "";
    public int Numero { get; set; }
    public Pedido Pedido { get; set; } = null!;
}

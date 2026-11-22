using Cinema.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Cinema.Api.Data;

public class CinemaContext(DbContextOptions<CinemaContext> opcoes) : DbContext(opcoes)
{
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Filme> Filmes => Set<Filme>();
    public DbSet<Sala> Salas => Set<Sala>();
    public DbSet<Sessao> Sessoes => Set<Sessao>();
    public DbSet<Pedido> Pedidos => Set<Pedido>();
    public DbSet<Ingresso> Ingressos => Set<Ingresso>();

    protected override void OnModelCreating(ModelBuilder modelo)
    {
        modelo.Entity<Usuario>().HasIndex(u => u.Email).IsUnique();
        modelo.Entity<Pedido>().HasIndex(p => p.Codigo).IsUnique();
        modelo.Entity<Ingresso>().HasIndex(i => new { i.SessaoId, i.Fileira, i.Numero }).IsUnique();
        modelo.Entity<Filme>().Property(f => f.Nota).HasPrecision(3, 1);
        modelo.Entity<Sessao>().Property(s => s.Preco).HasPrecision(8, 2);
        modelo.Entity<Pedido>().Property(p => p.Total).HasPrecision(8, 2);
    }
}

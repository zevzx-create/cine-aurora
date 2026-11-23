namespace Cinema.Api.Services;

public static class AdminAccess
{
    // Lista configurada somente no servidor: Admin__Emails=email@exemplo.com
    public static bool Permitido(string? email, IConfiguration configuracao)
    {
        if (string.IsNullOrWhiteSpace(email)) return false;

        var autorizados = configuracao["Admin:Emails"];
        if (string.IsNullOrWhiteSpace(autorizados)) return false;

        return autorizados
            .Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Any(endereco => string.Equals(endereco, email, StringComparison.OrdinalIgnoreCase));
    }
}

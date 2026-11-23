# Cine Aura — filmes reais e pôsteres

**Nome público: Cine Aura.** Sistema demonstrativo de venda de ingressos: React Native + Expo, API em C#/.NET 8 e banco MySQL.

## ATUALIZAÇÃO NO SEU SITE PUBLICADO

**Antes de mesclar esta atualização no GitHub:**

1. Conecte-se ao banco Railway pelo MySQL Workbench e dê dois cliques no schema `railway`.
2. Abra `database/ATUALIZAR-BANCO-FILMES-REAIS.sql` em **File > Open SQL Script**.
3. Execute o arquivo inteiro clicando no ícone do raio. O SELECT final deve mostrar oito filmes reais.
4. Só depois mescle o pull request `filmes-reais-e-posters` para `main`.
5. Railway e Netlify receberão os arquivos novos automaticamente se os deploys automáticos estiverem habilitados.
6. Confira a API em `https://cine-aurora-production.up.railway.app/api/filmes` e o site em `https://cine-aurorazz.netlify.app/`.

**Não execute novamente o arquivo `cinema-hospedagem.sql` no banco existente**, pois ele é de instalação inicial. O script `ATUALIZAR-BANCO-FILMES-REAIS.sql` mantém usuários, pedidos, ingressos e as sessões antigas para preservar históricos.

### Arquivos importantes
- `database/ATUALIZAR-BANCO-FILMES-REAIS.sql` — atualização segura do MySQL existente.
- `database/cinema.sql` — instalação de um banco novo local (apaga o banco `cinema`).
- `database/cinema-hospedagem.sql` — instalação em banco novo hospedado.
- `backend/` — API C# (.NET 8, ASP.NET Core e JWT).
- `app/` — React Native + Expo para web e celular.

### Observações
- Os oito títulos são filmes reais. As notas, sessões e preços são **ilustrativos** e não representam a programação oficial de cinemas.
- Imagens carregadas de `image.tmdb.org` e exibidas com fallback de cor.
- As chaves do Railway devem permanecer apenas nas variáveis de ambiente.

Crédito: This product uses the TMDB API but is not endorsed or certified by TMDB.
Imagens e marcas dos filmes pertencem aos respectivos titulares.

## Minha conta e exclusão
- Usuários autenticados acessam **Minha conta** no cabeçalho.
- **Excluir conta** exige a senha e uma confirmação explícita.
- A API `DELETE /api/auth/conta` utiliza o JWT para identificar o titular e verifica a senha BCrypt.
- A exclusão é definitiva: remove o usuário, seus pedidos e ingressos vinculados, em transação. Filmes, sessões e pedidos de outras contas são preservados.
- Após a exclusão, o aplicativo limpa a sessão local e retorna à página inicial.
- Não é necessária migração adicional no MySQL.

## Nome público e serviços
O nome mostrado no aplicativo e os metadados do Expo são **Cine Aura**. Os identificadores técnicos existentes (namespace `Cinema.Api`, schema MySQL `railway`, nomes internos e URLs já implantadas) são mantidos para preservar as conexões. Para trocar o endereço `cine-aurorazz.netlify.app` ou nomes de serviços no Railway/GitHub, ajuste-os nos respectivos painéis e confira os vínculos de deploy.

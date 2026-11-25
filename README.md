# Cine Aura

Aplicação de cinema com catálogo de filmes, autenticação de usuários, sessões e reservas de assentos.

## Tecnologias

- **Frontend:** React Native, Expo e React Native Web
- **Backend:** ASP.NET Core (.NET 8), C# e Entity Framework Core
- **Banco de dados:** MySQL 8
- **Hospedagem:** Railway (API e banco) e Netlify (frontend)

## Estrutura

```text
app/          Aplicação Expo
backend/      API ASP.NET Core
database/     Scripts SQL
```

## Configuração

### Banco de dados

Para uma instalação nova, execute `database/cinema-hospedagem.sql` no banco MySQL selecionado. Para atualizar o catálogo do banco já publicado, execute `database/ATUALIZAR-CATALOGO-2026.sql`. Para ativar sessões de pré-venda e deixar os nove filmes em cartaz, execute depois `database/ATUALIZAR-PRE-VENDA-FINAL.sql` no MySQL Workbench. Não execute o script de instalação inicial sobre um banco com dados existentes.

### API

Na pasta `backend`, configure as variáveis de ambiente:

| Variável | Descrição |
| --- | --- |
| `ConnectionStrings__Cinema` | String de conexão com o MySQL |
| `Jwt__Chave` | Chave secreta usada na assinatura dos tokens JWT |
| `Admin__Emails` | E-mail(s) autorizado(s) para a dashboard, separados por vírgula (definir somente no Railway) |

Inicie a API localmente com:

```bash
cd backend
dotnet run
```

### Frontend

Na pasta `app`, configure `EXPO_PUBLIC_API_URL` com o endereço base da API (sem `/api` no final).

```bash
cd app
npm install
npx expo start --web
```

Para gerar os arquivos estáticos do site:

```bash
npx expo export --platform web
```

A saída fica em `app/dist`.

## Funcionalidades

- Catálogo com filtros por gênero e páginas de detalhes
- Cadastro e login com senha protegida por hash
- Consulta de sessões e seleção de assentos
- Registro e consulta de pedidos e ingressos
- Exclusão de conta autenticada, com confirmação de senha
- Dashboard administrativa privada com indicadores, ranking de filmes e últimos pedidos
- CRUD administrativo de filmes e sessões, com edição de preços e persistência no MySQL

## Observações

Os horários e valores cadastrados no banco são dados de teste e não representam a programação comercial de um cinema. Lançamentos futuros aparecem como Em breve, sem sessões criadas antecipadamente. As imagens promocionais são servidas por distribuidores, veículos de cinema e TMDB; os direitos pertencem aos respectivos titulares.

This product uses the TMDB API but is not endorsed or certified by TMDB.

## Dashboard administrativa

A tela **Dashboard** mostra, diretamente do MySQL:
- Faturamento de demonstração (soma dos pedidos);
- Quantidade de ingressos e pedidos;
- Usuários cadastrados e filmes em cartaz;
- Ranking de filmes por ingressos e compras recentes.

**Acesso seguro:** o endpoint `GET /api/admin/resumo` exige JWT válido e só retorna os dados quando o e-mail da conta está configurado na variável de ambiente `Admin__Emails` da API. Sem configuração, ninguém tem acesso — não existe senha administrativa fixa no código.

1. Cadastre uma conta ou utilize uma conta já existente no Cine Aura.
2. No Railway, abra o serviço **cine-aurora → Variables**.
3. Adicione `Admin__Emails` com **o endereço de e-mail exato da conta**. Para mais de um administrador, separe os e-mails por vírgula. Não coloque o e-mail no código-fonte.
4. Publique/reinicie a API para aplicar a variável, caso necessário.
5. Saia do Cine Aura e entre novamente. A opção **Painel** aparece no menu em telas grandes e **Abrir dashboard administrativa** em Minha conta (inclusive no celular).
6. Faça uma compra de teste e clique em **Atualizar dados** para ver os indicadores mudarem.

A permissão é verificada **no backend e no banco**, não apenas escondendo links do frontend. Os números são dados demonstrativos: não há processador de pagamento real. Não é necessário executar novas migrações SQL no banco existente.

## CRUD do administrador

Em **Dashboard → Gerenciar filmes e sessões**, a conta autorizada por `Admin__Emails` pode:

- Criar filmes, editar título, sinopse, gênero, ano, nota, classificação, duração, cores, cartaz, banner e situação do catálogo.
- Retirar filmes do catálogo e reativá-los. A retirada é **lógica** (`em_cartaz=0`), preservando sessões, pedidos e ingressos existentes.
- Criar sessões, selecionar filme, sala, data/hora, formato e preço do ingresso (preço individual por sessão).
- Editar ou excluir sessões sem pedidos. Sessões com vendas não podem ser editadas nem excluídas, para preservar o histórico.

As alterações são enviadas à API C# por `GET/POST/PUT/DELETE /api/admin/filmes` e `/api/admin/sessoes` (e `GET /api/admin/salas`). Todos os endpoints administrativos exigem token JWT e conferem a permissão **no banco e no servidor**. O SQL usa as tabelas existentes, sem nova migração.

Para demonstrar no MySQL Workbench após cadastrar ou editar:

```sql
USE railway;
SELECT id, titulo, ano, em_cartaz, poster_url FROM filmes ORDER BY id DESC;
SELECT id, filme_id, sala_id, inicio, preco, formato FROM sessoes ORDER BY id DESC;
```

Não existe cobrança real por cartão; `preco` é o valor cobrado pelas compras simuladas de uma determinada sessão. Para mudar o preço de sessões existentes, edite individualmente uma sessão sem pedidos.

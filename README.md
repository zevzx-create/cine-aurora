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

Para uma instalação nova, execute `database/cinema-hospedagem.sql` no banco MySQL selecionado. Para atualizar o catálogo do banco já publicado, execute `database/ATUALIZAR-CATALOGO-2026.sql`. Não execute o script de instalação inicial sobre um banco com dados existentes.

### API

Na pasta `backend`, configure as variáveis de ambiente:

| Variável | Descrição |
| --- | --- |
| `ConnectionStrings__Cinema` | String de conexão com o MySQL |
| `Jwt__Chave` | Chave secreta usada na assinatura dos tokens JWT |

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

## Observações

Os horários e valores cadastrados no banco são dados de teste e não representam a programação comercial de um cinema. Lançamentos futuros aparecem como Em breve, sem sessões criadas antecipadamente. As imagens promocionais são servidas por distribuidores, veículos de cinema e TMDB; os direitos pertencem aos respectivos titulares.

This product uses the TMDB API but is not endorsed or certified by TMDB.

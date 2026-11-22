# Cine Aurora

Sistema de venda de ingressos de cinema.

- `database/cinema.sql`: script do MySQL local (tabelas e dados iniciais)
- `database/cinema-hospedagem.sql`: mesmo script, sem criar o banco, para MySQL hospedado
- `backend/`: API em C# (.NET 8, ASP.NET Core, Entity Framework Core, JWT)
- `app/`: front-end em React Native (Expo), roda no navegador e no celular

## Como rodar localmente

1. MySQL: execute `database/cinema.sql` no MySQL Workbench.
2. API: em `backend/`, ajuste a senha em `appsettings.json` e rode `dotnet run`. Swagger em http://localhost:5080/swagger
3. App: em `app/`, rode `npm install` e depois `npx expo start --web`.

## Como publicar

- API: `backend/Dockerfile`, variáveis `ConnectionStrings__Cinema` e `Jwt__Chave`.
- Site: em `app/`, `EXPO_PUBLIC_API_URL=https://URL-DA-API npx expo export --platform web` e publicar a pasta `dist`.

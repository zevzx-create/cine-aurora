USE railway;

SET @anterior_sql_safe_updates := @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

DROP TEMPORARY TABLE IF EXISTS novo_catalogo_cine_aura;
CREATE TEMPORARY TABLE novo_catalogo_cine_aura (
  titulo VARCHAR(140) NOT NULL,
  sinopse TEXT NOT NULL,
  genero VARCHAR(40) NOT NULL,
  duracao_min INT NOT NULL,
  classificacao VARCHAR(4) NOT NULL,
  nota DECIMAL(3,1) NOT NULL,
  ano INT NOT NULL,
  cor_primaria VARCHAR(9) NOT NULL,
  cor_secundaria VARCHAR(9) NOT NULL,
  em_cartaz TINYINT(1) NOT NULL,
  poster_url VARCHAR(500) NULL,
  banner_url VARCHAR(500) NULL
);

INSERT INTO novo_catalogo_cine_aura (titulo, sinopse, genero, duracao_min, classificacao, nota, ano, cor_primaria, cor_secundaria, em_cartaz, poster_url, banner_url) VALUES
('Eu Sou o Rocky', 'A trajetória de Sylvester Stallone para transformar seu roteiro em Rocky: Um Lutador, enfrentando rejeições e apostando no sonho de interpretar o protagonista.', 'Drama', 128, '12', 0, 2026, '#263443', '#c59e64', 1, 'https://ingresso-a.akamaihd.net/prd/img/movie/eu-sou-o-rocky/c5f58ee4-13d7-4e64-8659-4e0cb7952cfc.webp', 'https://ingresso-a.akamaihd.net/prd/img/movie/eu-sou-o-rocky/c5f58ee4-13d7-4e64-8659-4e0cb7952cfc.webp'),
('As Novas Desventuras de Cliff Booth', 'Na Los Angeles de 1977, o dublê Cliff Booth trabalha solucionando problemas delicados nos bastidores de Hollywood.', 'Suspense', 143, 'A', 0, 2026, '#392419', '#d2a947', 1, 'https://raw.githubusercontent.com/zevzx-create/cine-aurora/main/app/assets/posters/cliff-booth.jpg', 'https://raw.githubusercontent.com/zevzx-create/cine-aurora/main/app/assets/posters/cliff-booth.jpg'),
('Duna: Parte Três', 'Denis Villeneuve encerra sua trilogia de Duna acompanhando o destino de Paul Atreides e as consequências de seu poder sobre o universo.', 'Ficção', 150, 'A', 0, 2026, '#191719', '#6d5541', 1, 'https://image.tmdb.org/t/p/original/gp1MVNsRyH76PHlJVhRk6PHylDY.jpg', 'https://image.tmdb.org/t/p/original/gp1MVNsRyH76PHlJVhRk6PHylDY.jpg'),
('Vingadores: Doomsday', 'Heróis de diferentes universos da Marvel enfrentam uma ameaça capaz de colocar em risco a existência de suas realidades.', 'Ação', 0, 'A', 0, 2026, '#0a241d', '#417159', 1, 'https://lumiere-a.akamaihd.net/v1/images/g_movies_avengersdoomsday_poster_b81ec5ee.jpeg?region=0,0,1300,730', 'https://lumiere-a.akamaihd.net/v1/images/g_movies_avengersdoomsday_poster_b81ec5ee.jpeg?region=0,0,1300,730'),
('Jumanji: Open World', 'O mundo de Jumanji escapa do videogame e invade a realidade; os antigos heróis precisam enfrentar uma nova aventura fora da selva.', 'Aventura', 0, 'A', 0, 2026, '#203a27', '#bc7a2c', 1, 'https://www.sonypictures.com/sites/default/files/styles/max_860x460/public/title-key-art/jumanjiopenworld_onesheet_1400x2100.jpg?itok=LhCaGOKF', 'https://www.sonypictures.com/sites/default/files/styles/max_860x460/public/title-key-art/jumanjiopenworld_onesheet_1400x2100.jpg?itok=LhCaGOKF'),
('A Odisseia', 'Após a Guerra de Troia, Odisseu enfrenta perigos e criaturas míticas durante a longa jornada de volta para sua família em Ítaca.', 'Aventura', 172, '14', 0, 2026, '#102d3c', '#405b72', 1, 'https://dx35vtwkllhj9.cloudfront.net/universalstudios/the-odyssey/images/regions/ca/onesheet.jpg', 'https://dx35vtwkllhj9.cloudfront.net/universalstudios/the-odyssey/images/regions/ca/onesheet.jpg');

START TRANSACTION;

UPDATE filmes SET em_cartaz = 0 WHERE id > 0 AND titulo NOT IN ('Eu Sou o Rocky', 'As Novas Desventuras de Cliff Booth', 'Duna: Parte Três', 'Vingadores: Doomsday', 'Jumanji: Open World', 'A Odisseia', 'Homem-Aranha: Através do Aranhaverso', 'Divertida Mente 2', 'Avatar: O Caminho da Água');

INSERT INTO filmes (titulo, sinopse, genero, duracao_min, classificacao, nota, ano, cor_primaria, cor_secundaria, em_cartaz, poster_url, banner_url)
SELECT n.titulo, n.sinopse, n.genero, n.duracao_min, n.classificacao, n.nota,
       n.ano, n.cor_primaria, n.cor_secundaria, n.em_cartaz, n.poster_url, n.banner_url
FROM novo_catalogo_cine_aura n
WHERE NOT EXISTS (SELECT 1 FROM filmes f WHERE f.titulo = n.titulo);

UPDATE filmes f
JOIN novo_catalogo_cine_aura n ON f.titulo = n.titulo
SET f.sinopse = n.sinopse, f.genero = n.genero, f.duracao_min = n.duracao_min,
    f.classificacao = n.classificacao, f.nota = n.nota, f.ano = n.ano,
    f.cor_primaria = n.cor_primaria, f.cor_secundaria = n.cor_secundaria,
    f.em_cartaz = 1, f.poster_url = n.poster_url, f.banner_url = n.banner_url;

UPDATE filmes SET em_cartaz = 1
WHERE id > 0 AND titulo IN ('Homem-Aranha: Através do Aranhaverso', 'Divertida Mente 2', 'Avatar: O Caminho da Água');

COMMIT;

INSERT INTO sessoes (filme_id, sala_id, inicio, preco, formato)
SELECT f.id, sa.id,
       TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL d.dia DAY), h.horario),
       h.preco, '2D'
FROM filmes f
JOIN salas sa ON sa.nome = 'Sala 1'
CROSS JOIN (SELECT 0 AS dia UNION ALL SELECT 1 UNION ALL SELECT 2
            UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6) d
CROSS JOIN (SELECT '16:00:00' AS horario, 30.00 AS preco
            UNION ALL SELECT '20:00:00', 38.00) h
WHERE f.titulo IN ('Eu Sou o Rocky', 'A Odisseia')
  AND NOT EXISTS (
     SELECT 1 FROM sessoes s
     WHERE s.filme_id = f.id
       AND s.inicio = TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL d.dia DAY), h.horario)
  );

DROP TEMPORARY TABLE novo_catalogo_cine_aura;
SET SQL_SAFE_UPDATES = @anterior_sql_safe_updates;

SELECT id, titulo, ano, poster_url
FROM filmes WHERE em_cartaz = 1
ORDER BY ano DESC, titulo;

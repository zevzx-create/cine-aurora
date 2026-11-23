
SET @add_col = IF(EXISTS(
  SELECT 1 FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'filmes' AND COLUMN_NAME = 'poster_url'
), 'SELECT 1', 'ALTER TABLE filmes ADD COLUMN poster_url VARCHAR(500) NULL');
PREPARE cmd FROM @add_col;
EXECUTE cmd;
DEALLOCATE PREPARE cmd;

SET @add_col = IF(EXISTS(
  SELECT 1 FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'filmes' AND COLUMN_NAME = 'banner_url'
), 'SELECT 1', 'ALTER TABLE filmes ADD COLUMN banner_url VARCHAR(500) NULL');
PREPARE cmd FROM @add_col;
EXECUTE cmd;
DEALLOCATE PREPARE cmd;

UPDATE filmes SET em_cartaz = 0
WHERE titulo IN (
  'Noite sem Estrelas', 'O Último Farol', 'Rota 66 Reversa', 'Cartas para Marina',
  'Cidade de Vidro', 'A Casa do Vale', 'Pequenos Gigantes', 'Sertão Vivo'
);

DROP TEMPORARY TABLE IF EXISTS cine_novos_filmes;
CREATE TEMPORARY TABLE cine_novos_filmes (
  titulo VARCHAR(140), sinopse TEXT, genero VARCHAR(40), duracao_min INT,
  classificacao VARCHAR(4), nota DECIMAL(3,1), ano INT,
  cor_primaria VARCHAR(9), cor_secundaria VARCHAR(9), em_cartaz TINYINT(1),
  poster_url VARCHAR(500), banner_url VARCHAR(500)
);

INSERT INTO cine_novos_filmes (titulo, sinopse, genero, duracao_min, classificacao, nota, ano, cor_primaria, cor_secundaria, em_cartaz, poster_url, banner_url) VALUES
('Interstellar', 'Com a Terra à beira de um colapso ambiental, um ex-piloto da NASA parte em uma missão espacial para encontrar um novo lar para a humanidade.', 'Ficção', 169, '10', 8.7, 2014, '#132b3b', '#607d8b', 1, 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', NULL),
('Duna: Parte Dois', 'Paul Atreides se une a Chani e aos Fremen em uma jornada de vingança e precisa escolher entre o amor e o destino do universo.', 'Ficção', 166, '14', 8.6, 2024, '#412015', '#e2883e', 1, 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', 'https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg'),
('Oppenheimer', 'O físico J. Robert Oppenheimer lidera uma equipe de cientistas no desenvolvimento da bomba atômica e enfrenta as consequências de sua criação.', 'Drama', 180, '16', 8.3, 2023, '#35170a', '#b84e16', 1, 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', NULL),
('Batman', 'Em Gotham City, Batman investiga uma série de crimes e descobre segredos que ligam a corrupção da cidade à sua própria família.', 'Ação', 176, '14', 7.8, 2022, '#210c0c', '#b54f23', 1, 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg', 'https://image.tmdb.org/t/p/w1280/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg'),
('Homem-Aranha: Através do Aranhaverso', 'Miles Morales viaja pelo multiverso e conhece outros heróis aracnídeos, mas entra em conflito com a equipe que tenta proteger as diferentes realidades.', 'Animação', 140, '10', 8.5, 2023, '#271952', '#e74c3c', 1, 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg', NULL),
('Divertida Mente 2', 'Riley chega à adolescência e suas emoções precisam lidar com novas visitantes na sala de controle, incluindo a Ansiedade.', 'Animação', 96, 'L', 7.7, 2024, '#332e83', '#d66da8', 1, 'https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg', 'https://image.tmdb.org/t/p/w1280/p5ozvmdgsmbWe0H8Xk7Rc8SCwAB.jpg'),
('Barbie', 'Após questionar sua vida aparentemente perfeita na Barbielândia, Barbie viaja ao mundo real acompanhada por Ken para descobrir seu lugar nele.', 'Comédia', 114, '12', 7, 2023, '#d43493', '#64c4ee', 1, 'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg', NULL),
('Avatar: O Caminho da Água', 'Jake Sully e Neytiri buscam proteger a família e encontram refúgio entre os povos oceânicos de Pandora diante de uma nova ameaça.', 'Aventura', 192, '14', 7.6, 2022, '#043947', '#33c0d2', 1, 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg', 'https://image.tmdb.org/t/p/w1280/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg');

INSERT INTO filmes (titulo, sinopse, genero, duracao_min, classificacao, nota, ano, cor_primaria, cor_secundaria, em_cartaz, poster_url, banner_url)
SELECT n.titulo, n.sinopse, n.genero, n.duracao_min, n.classificacao, n.nota, n.ano, n.cor_primaria, n.cor_secundaria, n.em_cartaz, n.poster_url, n.banner_url
FROM cine_novos_filmes n
WHERE NOT EXISTS (SELECT 1 FROM filmes f WHERE f.titulo=n.titulo AND f.ano=n.ano);

UPDATE filmes f
JOIN cine_novos_filmes n ON f.titulo=n.titulo AND f.ano=n.ano
SET f.sinopse=n.sinopse, f.genero=n.genero, f.duracao_min=n.duracao_min,
    f.classificacao=n.classificacao, f.nota=n.nota, f.cor_primaria=n.cor_primaria,
    f.cor_secundaria=n.cor_secundaria, f.em_cartaz=1, f.poster_url=n.poster_url, f.banner_url=n.banner_url;

INSERT INTO sessoes (filme_id, sala_id, inicio, preco, formato)
SELECT f.id, 1 + MOD(f.id + h.ordem, 3),
       TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL dias.dia DAY), h.horario),
       h.preco, h.formato
FROM filmes f
JOIN cine_novos_filmes n ON n.titulo=f.titulo AND n.ano=f.ano
CROSS JOIN (SELECT 0 dia UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
            UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6) dias
CROSS JOIN (SELECT 0 ordem, '15:20:00' horario, 30.00 preco, '2D' formato
            UNION ALL SELECT 1, '20:10:00', 38.00, '2D') h
WHERE NOT EXISTS (
  SELECT 1 FROM sessoes s
  WHERE s.filme_id=f.id
    AND s.inicio=TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL dias.dia DAY), h.horario)
);

DROP TEMPORARY TABLE cine_novos_filmes;
SELECT id, titulo, poster_url, banner_url FROM filmes WHERE em_cartaz=1 ORDER BY nota DESC;

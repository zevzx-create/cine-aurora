DROP DATABASE IF EXISTS cinema;
CREATE DATABASE cinema CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cinema;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  senha_hash VARCHAR(100) NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE filmes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(140) NOT NULL,
  sinopse TEXT NOT NULL,
  genero VARCHAR(40) NOT NULL,
  duracao_min INT NOT NULL,
  classificacao VARCHAR(4) NOT NULL,
  nota DECIMAL(3,1) NOT NULL,
  ano INT NOT NULL,
  cor_primaria VARCHAR(9) NOT NULL,
  cor_secundaria VARCHAR(9) NOT NULL,
  em_cartaz TINYINT(1) NOT NULL DEFAULT 1,
  poster_url VARCHAR(500) NULL,
  banner_url VARCHAR(500) NULL
);

CREATE TABLE salas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(40) NOT NULL,
  fileiras INT NOT NULL,
  colunas INT NOT NULL
);

CREATE TABLE sessoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filme_id INT NOT NULL,
  sala_id INT NOT NULL,
  inicio DATETIME NOT NULL,
  preco DECIMAL(8,2) NOT NULL,
  formato VARCHAR(8) NOT NULL,
  FOREIGN KEY (filme_id) REFERENCES filmes(id),
  FOREIGN KEY (sala_id) REFERENCES salas(id),
  INDEX idx_sessoes_filme_inicio (filme_id, inicio)
);

CREATE TABLE pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(12) NOT NULL UNIQUE,
  usuario_id INT NOT NULL,
  sessao_id INT NOT NULL,
  total DECIMAL(8,2) NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (sessao_id) REFERENCES sessoes(id)
);

CREATE TABLE ingressos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  sessao_id INT NOT NULL,
  fileira CHAR(1) NOT NULL,
  numero INT NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (sessao_id) REFERENCES sessoes(id),
  UNIQUE KEY uq_assento_sessao (sessao_id, fileira, numero)
);

INSERT INTO salas (nome, fileiras, colunas) VALUES
('Sala 1', 8, 10),
('Sala 2', 8, 12),
('Sala 3', 6, 8);

INSERT INTO filmes (titulo, sinopse, genero, duracao_min, classificacao, nota, ano, cor_primaria, cor_secundaria, em_cartaz, poster_url, banner_url) VALUES
('Eu Sou o Rocky', 'A trajetória de Sylvester Stallone para transformar seu roteiro em Rocky: Um Lutador, enfrentando rejeições e apostando no sonho de interpretar o protagonista.', 'Drama', 128, '12', 0, 2026, '#263443', '#c59e64', 1, 'https://ingresso-a.akamaihd.net/prd/img/movie/eu-sou-o-rocky/c5f58ee4-13d7-4e64-8659-4e0cb7952cfc.webp', 'https://ingresso-a.akamaihd.net/prd/img/movie/eu-sou-o-rocky/c5f58ee4-13d7-4e64-8659-4e0cb7952cfc.webp'),
('As Novas Desventuras de Cliff Booth', 'Na Los Angeles de 1977, o dublê Cliff Booth trabalha solucionando problemas delicados nos bastidores de Hollywood.', 'Suspense', 143, 'A', 0, 2026, '#392419', '#d2a947', 1, 'https://raw.githubusercontent.com/zevzx-create/cine-aurora/main/app/assets/posters/cliff-booth.jpg', 'https://raw.githubusercontent.com/zevzx-create/cine-aurora/main/app/assets/posters/cliff-booth.jpg'),
('Duna: Parte Três', 'Denis Villeneuve encerra sua trilogia de Duna acompanhando o destino de Paul Atreides e as consequências de seu poder sobre o universo.', 'Ficção', 150, 'A', 0, 2026, '#191719', '#6d5541', 1, 'https://image.tmdb.org/t/p/original/gp1MVNsRyH76PHlJVhRk6PHylDY.jpg', 'https://image.tmdb.org/t/p/original/gp1MVNsRyH76PHlJVhRk6PHylDY.jpg'),
('Vingadores: Doomsday', 'Heróis de diferentes universos da Marvel enfrentam uma ameaça capaz de colocar em risco a existência de suas realidades.', 'Ação', 0, 'A', 0, 2026, '#0a241d', '#417159', 1, 'https://lumiere-a.akamaihd.net/v1/images/g_movies_avengersdoomsday_poster_b81ec5ee.jpeg?region=0,0,1300,730', 'https://lumiere-a.akamaihd.net/v1/images/g_movies_avengersdoomsday_poster_b81ec5ee.jpeg?region=0,0,1300,730'),
('Jumanji: Open World', 'O mundo de Jumanji escapa do videogame e invade a realidade; os antigos heróis precisam enfrentar uma nova aventura fora da selva.', 'Aventura', 0, 'A', 0, 2026, '#203a27', '#bc7a2c', 1, 'https://www.sonypictures.com/sites/default/files/styles/max_860x460/public/title-key-art/jumanjiopenworld_onesheet_1400x2100.jpg?itok=LhCaGOKF', 'https://www.sonypictures.com/sites/default/files/styles/max_860x460/public/title-key-art/jumanjiopenworld_onesheet_1400x2100.jpg?itok=LhCaGOKF'),
('A Odisseia', 'Após a Guerra de Troia, Odisseu enfrenta perigos e criaturas míticas durante a longa jornada de volta para sua família em Ítaca.', 'Aventura', 172, '14', 0, 2026, '#102d3c', '#405b72', 1, 'https://dx35vtwkllhj9.cloudfront.net/universalstudios/the-odyssey/images/regions/ca/onesheet.jpg', 'https://dx35vtwkllhj9.cloudfront.net/universalstudios/the-odyssey/images/regions/ca/onesheet.jpg'),
('Homem-Aranha: Através do Aranhaverso', 'Miles Morales viaja pelo multiverso e conhece outros heróis aracnídeos, mas entra em conflito com a equipe que tenta proteger as diferentes realidades.', 'Animação', 140, '10', 8.5, 2023, '#271952', '#e74c3c', 1, 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg', NULL),
('Divertida Mente 2', 'Riley chega à adolescência e suas emoções precisam lidar com novas visitantes na sala de controle, incluindo a Ansiedade.', 'Animação', 96, 'L', 7.7, 2024, '#332e83', '#d66da8', 1, 'https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg', 'https://image.tmdb.org/t/p/w1280/p5ozvmdgsmbWe0H8Xk7Rc8SCwAB.jpg'),
('Avatar: O Caminho da Água', 'Jake Sully e Neytiri buscam proteger a família e encontram refúgio entre os povos oceânicos de Pandora diante de uma nova ameaça.', 'Aventura', 192, '14', 7.6, 2022, '#043947', '#33c0d2', 1, 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg', 'https://image.tmdb.org/t/p/w1280/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg');

INSERT INTO sessoes (filme_id, sala_id, inicio, preco, formato)
SELECT f.id,
       1 + ((f.id + h.ordem) % 3),
       TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL d.n DAY), h.hora),
       h.preco,
       h.formato
FROM filmes f
CROSS JOIN (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6) d
CROSS JOIN (
  SELECT 0 AS ordem, '14:30:00' AS hora, 28.00 AS preco, '2D' AS formato
  UNION ALL SELECT 1, '17:00:00', 32.00, '2D'
  UNION ALL SELECT 2, '19:40:00', 38.00, '3D'
  UNION ALL SELECT 3, '22:10:00', 34.00, '2D'
) h
WHERE f.titulo IN ('Eu Sou o Rocky', 'A Odisseia', 'Homem-Aranha: Através do Aranhaverso', 'Divertida Mente 2', 'Avatar: O Caminho da Água');

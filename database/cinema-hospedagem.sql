
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
('Interstellar', 'Com a Terra à beira de um colapso ambiental, um ex-piloto da NASA parte em uma missão espacial para encontrar um novo lar para a humanidade.', 'Ficção', 169, '10', 8.7, 2014, '#132b3b', '#607d8b', 1, 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', NULL),
('Duna: Parte Dois', 'Paul Atreides se une a Chani e aos Fremen em uma jornada de vingança e precisa escolher entre o amor e o destino do universo.', 'Ficção', 166, '14', 8.6, 2024, '#412015', '#e2883e', 1, 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', 'https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg'),
('Oppenheimer', 'O físico J. Robert Oppenheimer lidera uma equipe de cientistas no desenvolvimento da bomba atômica e enfrenta as consequências de sua criação.', 'Drama', 180, '16', 8.3, 2023, '#35170a', '#b84e16', 1, 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', NULL),
('Batman', 'Em Gotham City, Batman investiga uma série de crimes e descobre segredos que ligam a corrupção da cidade à sua própria família.', 'Ação', 176, '14', 7.8, 2022, '#210c0c', '#b54f23', 1, 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg', 'https://image.tmdb.org/t/p/w1280/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg'),
('Homem-Aranha: Através do Aranhaverso', 'Miles Morales viaja pelo multiverso e conhece outros heróis aracnídeos, mas entra em conflito com a equipe que tenta proteger as diferentes realidades.', 'Animação', 140, '10', 8.5, 2023, '#271952', '#e74c3c', 1, 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg', NULL),
('Divertida Mente 2', 'Riley chega à adolescência e suas emoções precisam lidar com novas visitantes na sala de controle, incluindo a Ansiedade.', 'Animação', 96, 'L', 7.7, 2024, '#332e83', '#d66da8', 1, 'https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg', 'https://image.tmdb.org/t/p/w1280/p5ozvmdgsmbWe0H8Xk7Rc8SCwAB.jpg'),
('Barbie', 'Após questionar sua vida aparentemente perfeita na Barbielândia, Barbie viaja ao mundo real acompanhada por Ken para descobrir seu lugar nele.', 'Comédia', 114, '12', 7, 2023, '#d43493', '#64c4ee', 1, 'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg', NULL),
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
) h;


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
  em_cartaz TINYINT(1) NOT NULL DEFAULT 1
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

INSERT INTO filmes (titulo, sinopse, genero, duracao_min, classificacao, nota, ano, cor_primaria, cor_secundaria) VALUES
('Noite sem Estrelas', 'Uma astrônoma volta à cidade natal para investigar o apagão que deixou o céu inteiro escuro e descobre que alguém sabia exatamente quando aconteceria.', 'Suspense', 118, '14', 8.4, 2026, '#0f2027', '#2c5364'),
('O Último Farol', 'O faroleiro de uma ilha esquecida recebe uma carta de um navio que naufragou há trinta anos. A resposta dele muda o destino de todo o vilarejo.', 'Drama', 126, '12', 8.1, 2026, '#3a1c0f', '#b5651d'),
('Rota 66 Reversa', 'Um piloto aposentado aceita uma última corrida atravessando o país de volta, perseguido por quem ele deixou para trás em cada cidade.', 'Ação', 109, '14', 7.6, 2025, '#3d0c0c', '#c0392b'),
('Cartas para Marina', 'Durante um inverno inteiro, dois desconhecidos trocam cartas endereçadas à pessoa errada e acabam descobrindo mais um do outro do que de Marina.', 'Romance', 104, 'L', 7.9, 2026, '#4a1d3d', '#e08ba0'),
('Cidade de Vidro', 'Numa metrópole onde cada parede é transparente, uma engenheira encontra o único cômodo que ninguém consegue enxergar por dentro.', 'Ficção', 132, '12', 8.7, 2026, '#0b3d3a', '#4fd1c5'),
('A Casa do Vale', 'A família Antunes herda uma fazenda isolada. Na primeira noite, percebem que a casa tem um cômodo a mais do que a planta original.', 'Terror', 97, '16', 7.2, 2025, '#1a1a1a', '#6b0f1a'),
('Pequenos Gigantes', 'Uma turma de bichos do quintal decide montar o maior espetáculo que o bairro já viu antes que a demolição chegue.', 'Animação', 92, 'L', 8.0, 2026, '#1d3557', '#f4a261'),
('Sertão Vivo', 'Uma jovem geóloga e um vaqueiro viajam por três dias atrás de uma nascente lendária que pode salvar a região da seca.', 'Aventura', 114, '10', 7.8, 2026, '#5c3d0a', '#e9c46a');

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

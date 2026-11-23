USE railway;

SET @sql_safe_updates_anterior := @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

START TRANSACTION;

UPDATE filmes
SET em_cartaz = CASE
  WHEN titulo IN (
    'Eu Sou o Rocky',
    'As Novas Desventuras de Cliff Booth',
    'Duna: Parte Três',
    'Vingadores: Doomsday',
    'Jumanji: Open World',
    'A Odisseia',
    'Homem-Aranha: Através do Aranhaverso',
    'Divertida Mente 2',
    'Avatar: O Caminho da Água'
  ) THEN 1 ELSE 0 END
WHERE id > 0;

UPDATE filmes
SET duracao_min = 150
WHERE titulo = 'Duna: Parte Três';

UPDATE filmes
SET duracao_min = 143
WHERE titulo = 'As Novas Desventuras de Cliff Booth';

INSERT INTO sessoes (filme_id, sala_id, inicio, preco, formato)
SELECT f.id, s.id,
       TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL dias.dia DAY), horarios.hora),
       CASE
         WHEN f.titulo IN ('Duna: Parte Três', 'Vingadores: Doomsday')
           THEN horarios.preco + 6
         WHEN f.titulo = 'Jumanji: Open World'
           THEN horarios.preco + 4
         ELSE horarios.preco
       END,
       horarios.formato
FROM filmes f
CROSS JOIN (
  SELECT 0 dia UNION ALL SELECT 1 UNION ALL SELECT 2
  UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6
) dias
CROSS JOIN (
  SELECT 'Sala 1' sala, '14:30:00' hora, 28.00 preco, '2D' formato
  UNION ALL SELECT 'Sala 2', '17:20:00', 34.00, '2D'
  UNION ALL SELECT 'Sala 3', '20:10:00', 40.00, '3D'
) horarios
JOIN salas s ON s.nome = horarios.sala
WHERE f.em_cartaz = 1
  AND NOT EXISTS (
    SELECT 1 FROM sessoes antiga
    WHERE antiga.filme_id = f.id
      AND antiga.inicio = TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL dias.dia DAY), horarios.hora)
  );

COMMIT;

SET SQL_SAFE_UPDATES = @sql_safe_updates_anterior;

SELECT id, titulo, duracao_min, em_cartaz,
       CASE WHEN titulo IN (
         'As Novas Desventuras de Cliff Booth', 'Duna: Parte Três',
         'Vingadores: Doomsday', 'Jumanji: Open World'
       ) THEN 'Pré-venda' ELSE 'Em cartaz' END AS status
FROM filmes
WHERE em_cartaz = 1
ORDER BY ano DESC, titulo;

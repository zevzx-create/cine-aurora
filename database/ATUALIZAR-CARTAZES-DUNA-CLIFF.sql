USE railway;

SET @sql_safe_updates_anterior := @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

UPDATE filmes
SET poster_url = 'https://raw.githubusercontent.com/zevzx-create/cine-aurora/main/app/assets/posters/cliff-booth.jpg',
    banner_url = 'https://raw.githubusercontent.com/zevzx-create/cine-aurora/main/app/assets/posters/cliff-booth.jpg'
WHERE titulo = 'As Novas Desventuras de Cliff Booth';

UPDATE filmes
SET poster_url = 'https://image.tmdb.org/t/p/original/gp1MVNsRyH76PHlJVhRk6PHylDY.jpg',
    banner_url = 'https://image.tmdb.org/t/p/original/gp1MVNsRyH76PHlJVhRk6PHylDY.jpg',
    duracao_min = 150
WHERE titulo = 'Duna: Parte Três';

SET SQL_SAFE_UPDATES = @sql_safe_updates_anterior;

SELECT id, titulo, duracao_min, poster_url
FROM filmes
WHERE titulo IN ('As Novas Desventuras de Cliff Booth', 'Duna: Parte Três');

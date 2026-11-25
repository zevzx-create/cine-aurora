const imagens = {
  'Eu Sou o Rocky': {
    poster: 'https://ingresso-a.akamaihd.net/prd/img/movie/eu-sou-o-rocky/c5f58ee4-13d7-4e64-8659-4e0cb7952cfc.webp',
    banner: 'https://ingresso-a.akamaihd.net/prd/img/movie/eu-sou-o-rocky/c5f58ee4-13d7-4e64-8659-4e0cb7952cfc.webp',
  },
  'As Novas Desventuras de Cliff Booth': {
    poster: 'https://raw.githubusercontent.com/zevzx-create/cine-aurora/main/app/assets/posters/cliff-booth.jpg',
    banner: 'https://raw.githubusercontent.com/zevzx-create/cine-aurora/main/app/assets/posters/cliff-booth.jpg',
  },
  'Duna: Parte Três': {
    poster: 'https://image.tmdb.org/t/p/original/gp1MVNsRyH76PHlJVhRk6PHylDY.jpg',
    banner: 'https://image.tmdb.org/t/p/original/gp1MVNsRyH76PHlJVhRk6PHylDY.jpg',
  },
  'Vingadores: Doomsday': {
    poster: 'https://lumiere-a.akamaihd.net/v1/images/g_movies_avengersdoomsday_poster_b81ec5ee.jpeg?region=0,0,1300,730',
    banner: 'https://lumiere-a.akamaihd.net/v1/images/g_movies_avengersdoomsday_poster_b81ec5ee.jpeg?region=0,0,1300,730',
  },
  'Jumanji: Open World': {
    poster: 'https://www.sonypictures.com/sites/default/files/styles/max_860x460/public/title-key-art/jumanjiopenworld_onesheet_1400x2100.jpg?itok=LhCaGOKF',
    banner: 'https://www.sonypictures.com/sites/default/files/styles/max_860x460/public/title-key-art/jumanjiopenworld_onesheet_1400x2100.jpg?itok=LhCaGOKF',
  },
  'A Odisseia': {
    poster: 'https://dx35vtwkllhj9.cloudfront.net/universalstudios/the-odyssey/images/regions/ca/onesheet.jpg',
    banner: 'https://dx35vtwkllhj9.cloudfront.net/universalstudios/the-odyssey/images/regions/ca/onesheet.jpg',
  },
  'Homem-Aranha: Através do Aranhaverso': {
    poster: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    banner: null,
  },
  'Divertida Mente 2': {
    poster: 'https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
    banner: 'https://image.tmdb.org/t/p/w1280/p5ozvmdgsmbWe0H8Xk7Rc8SCwAB.jpg',
  },
  'Avatar: O Caminho da Água': {
    poster: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    banner: 'https://image.tmdb.org/t/p/w1280/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg',
  }
};

const estreias = {
  'As Novas Desventuras de Cliff Booth': '2026-11-25',
  'Duna: Parte Três': '2026-12-16',
  'Vingadores: Doomsday': '2026-12-16',
  'Jumanji: Open World': '2026-12-24',
};

const titulosPreVenda = new Set([
  'As Novas Desventuras de Cliff Booth',
  'Duna: Parte Três',
  'Vingadores: Doomsday',
  'Jumanji: Open World',
]);

export function emPreVenda(filme) {
  return !!filme && titulosPreVenda.has(filme.titulo);
}

export function estaEmBreve(filme) {
  const estreia = filme && estreias[filme.titulo];
  if (!estreia) return false;
  const hoje = new Date();
  const dataLocal = [hoje.getFullYear(), String(hoje.getMonth() + 1).padStart(2, '0'), String(hoje.getDate()).padStart(2, '0')].join('-');
  return dataLocal < estreia;
}

export function imagemFilme(filme, tipo = 'poster') {
  if (!filme) return null;
  const cadastrada = imagens[filme.titulo];
  if (tipo === 'banner')
    return filme.bannerUrl || filme.posterUrl || cadastrada?.banner || cadastrada?.poster || null;
  return filme.posterUrl || cadastrada?.poster || null;
}

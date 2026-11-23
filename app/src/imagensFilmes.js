/**
 * Pôsteres reais com URLs verificadas do TMDB.
 * Fallback local de metadados: não depende de atualizar a API para exibir imagens.
 * Imagens e marcas pertencem aos respectivos titulares.
 */
const filmes = {
  'Interstellar': {
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    banner: 'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
  },
  'Duna: Parte Dois': {
    poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    banner: 'https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
  },
  'Oppenheimer': {
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
  },
  'Batman': {
    poster: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
    banner: 'https://image.tmdb.org/t/p/w1280/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg',
  },
  'Homem-Aranha: Através do Aranhaverso': {
    poster: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
  },
  'Divertida Mente 2': {
    poster: 'https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
  },
  'Barbie': {
    poster: 'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg',
  },
  'Avatar: O Caminho da Água': {
    poster: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
  },
};

/** Retorna sempre URLs conhecidas para os filmes do catálogo, com suporte a filmes futuros. */
export function imagemFilme(filme, tipo = 'poster') {
  if (!filme) return null;
  const cadastrada = filmes[filme.titulo];

  if (tipo === 'banner') {
    return cadastrada?.banner || cadastrada?.poster || filme.bannerUrl || filme.posterUrl || null;
  }

  return cadastrada?.poster || filme.posterUrl || null;
}

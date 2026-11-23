import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../contexto';
import { listarFilmes } from '../api';
import Poster from '../componentes/Poster';
import Botao from '../componentes/Botao';
import Entrada from '../componentes/Entrada';
import Toque from '../componentes/Toque';
import { cores, serifa } from '../tema';
import { duracao } from '../utils';
import { imagemFilme } from '../imagensFilmes';

export default function Inicio() {
  const { navegar } = useApp();
  const { width } = useWindowDimensions();
  const [filmes, setFilmes] = useState([]);
  const [genero, setGenero] = useState('Todos');
  const [estado, setEstado] = useState('carregando');

  const carregar = useCallback(() => {
    setEstado('carregando');
    listarFilmes()
      .then((dados) => {
        setFilmes(dados);
        setEstado('ok');
      })
      .catch(() => setEstado('erro'));
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const generos = useMemo(() => ['Todos', ...new Set(filmes.map((f) => f.genero))], [filmes]);
  const lista = genero === 'Todos' ? filmes : filmes.filter((f) => f.genero === genero);
  const destaque = filmes.find((f) => imagemFilme(f, 'banner')) || filmes[0];

  const largo = width >= 800;
  const colunas = width >= 1100 ? 5 : width >= 800 ? 4 : width >= 560 ? 3 : 2;
  const espaco = 16;
  const conteudo = Math.min(width, 1240) - 40;
  const larguraCartao = Math.floor((conteudo - espaco * (colunas - 1)) / colunas);

  if (estado === 'carregando') {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator size="large" color={cores.ouro} />
      </View>
    );
  }

  if (estado === 'erro') {
    return (
      <View style={estilos.centro}>
        <Text style={estilos.erroTitulo}>Não deu para carregar os filmes</Text>
        <Text style={estilos.erroTexto}>Confira se a API está rodando e tente novamente.</Text>
        <Botao titulo="Tentar de novo" aoPressionar={carregar} tipo="contorno" style={{ marginTop: 18 }} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={estilos.rolagem} showsVerticalScrollIndicator={false}>
      <View style={[estilos.coluna, { maxWidth: 1240 }]}>
        {destaque && (
          <Entrada>
            <View style={[estilos.hero, { height: largo ? 400 : 340 }]}>
              <LinearGradient
                colors={[destaque.corPrimaria, destaque.corSecundaria]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              {imagemFilme(destaque, 'banner') && (
                <Image
                  source={{ uri: imagemFilme(destaque, 'banner') }}
                  resizeMode="cover"
                  style={estilos.imagemFundo}
                  accessibilityLabel={`Imagem do filme ${destaque.titulo}`}
                />
              )}
              <LinearGradient
                colors={largo ? ['rgba(8,7,11,0.96)', 'rgba(8,7,11,0.63)', 'rgba(8,7,11,0.1)'] : ['rgba(8,7,11,0.40)', 'rgba(8,7,11,0.94)']}
                start={{ x: 0, y: largo ? 0.5 : 0 }}
                end={{ x: largo ? 1 : 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={[estilos.heroTexto, { maxWidth: largo ? 560 : '100%' }]}>
                <Text style={estilos.heroEtiqueta}>EM DESTAQUE</Text>
                <Text style={[estilos.heroTitulo, { fontSize: largo ? 52 : 36, lineHeight: largo ? 58 : 40 }]}>
                  {destaque.titulo}
                </Text>
                <Text style={estilos.heroMeta}>
                  {destaque.genero} · {duracao(destaque.duracaoMin)} · {destaque.classificacao === 'L' ? 'Livre' : `${destaque.classificacao} anos`}
                </Text>
                <Text style={estilos.heroSinopse} numberOfLines={3}>
                  {destaque.sinopse}
                </Text>
                <Botao
                  titulo="Comprar ingresso"
                  aoPressionar={() => navegar('Filme', { id: destaque.id })}
                  style={{ alignSelf: 'flex-start', marginTop: 8 }}
                />
              </View>
            </View>
          </Entrada>
        )}

        <Text style={estilos.secao}>Catálogo de filmes</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.chips}>
          {generos.map((g) => (
            <Toque
              key={g}
              aoPressionar={() => setGenero(g)}
              style={[estilos.chip, genero === g && estilos.chipAtivo]}
            >
              <Text style={[estilos.chipTexto, genero === g && estilos.chipTextoAtivo]}>{g}</Text>
            </Toque>
          ))}
        </ScrollView>

        <View key={genero} style={[estilos.grade, { gap: espaco }]}>
          {lista.map((filme, i) => (
            <Poster
              key={filme.id}
              filme={filme}
              largura={larguraCartao}
              atraso={Math.min(i * 70, 560)}
              aoPressionar={() => navegar('Filme', { id: filme.id })}
            />
          ))}
        </View>
        <Text style={estilos.aviso}>Seleção de filmes reais · Sessões e preços demonstrativos. Imagens: TMDB.</Text>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  erroTitulo: { color: cores.texto, fontFamily: serifa, fontSize: 22, fontWeight: '700', textAlign: 'center' },
  erroTexto: { color: cores.suave, fontSize: 14, marginTop: 8, textAlign: 'center' },
  rolagem: { paddingBottom: 48, alignItems: 'center' },
  coluna: { width: '100%', paddingHorizontal: 20, paddingTop: 20 },
  hero: { borderRadius: 24, overflow: 'hidden', justifyContent: 'flex-end', padding: 28 },
  imagemFundo: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  heroTexto: { gap: 10 },
  heroEtiqueta: { color: cores.ouro, fontSize: 11, fontWeight: '800', letterSpacing: 3 },
  heroTitulo: { color: cores.texto, fontFamily: serifa, fontWeight: '700' },
  heroMeta: { color: 'rgba(255,255,255,0.75)', fontSize: 13, letterSpacing: 0.4 },
  heroSinopse: { color: 'rgba(255,255,255,0.82)', fontSize: 15, lineHeight: 22 },
  secao: { color: cores.texto, fontFamily: serifa, fontSize: 26, fontWeight: '700', marginTop: 36, marginBottom: 14 },
  chips: { gap: 10, paddingBottom: 20 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  chipAtivo: { backgroundColor: cores.ouro, borderColor: cores.ouro },
  chipTexto: { color: cores.suave, fontSize: 13, fontWeight: '600' },
  chipTextoAtivo: { color: cores.ouroEscuro },
  grade: { flexDirection: 'row', flexWrap: 'wrap' },
  aviso: { color: cores.suave, fontSize: 11, marginTop: 28, opacity: 0.8 },
});

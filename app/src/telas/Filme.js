import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { imagemFilme, estaEmBreve, emPreVenda } from '../imagensFilmes';
import { useApp } from '../contexto';
import { obterFilme, sessoesDoFilme } from '../api';
import Entrada from '../componentes/Entrada';
import Toque from '../componentes/Toque';
import { cores, serifa } from '../tema';
import { chaveDia, dataCurta, diaMes, diaSemana, duracao, hora, moeda } from '../utils';

const coresClassificacao = { L: '#2e9e5b', '10': '#2f7fc1', '12': '#d9b52f', '14': '#e08a2e', '16': '#d0443a', '18': '#222222' };

export default function Filme({ id }) {
  const { navegar } = useApp();
  const { width } = useWindowDimensions();
  const [filme, setFilme] = useState(null);
  const [sessoes, setSessoes] = useState([]);
  const [dia, setDia] = useState(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    Promise.all([obterFilme(id), sessoesDoFilme(id)])
      .then(([f, s]) => {
        setFilme(f);
        setSessoes(s);
        if (s.length) setDia(chaveDia(s[0].inicio));
      })
      .catch(() => setErro(true));
  }, [id]);

  const dias = useMemo(() => {
    const mapa = {};
    sessoes.forEach((s) => {
      const chave = chaveDia(s.inicio);
      (mapa[chave] = mapa[chave] || []).push(s);
    });
    return Object.entries(mapa);
  }, [sessoes]);

  const doDia = (dias.find(([chave]) => chave === dia) || [null, []])[1];
  const hoje = chaveDia(new Date());
  const largo = width >= 800;

  if (erro) {
    return (
      <View style={estilos.centro}>
        <Text style={estilos.erro}>Não foi possível carregar este filme.</Text>
      </View>
    );
  }

  if (!filme) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator size="large" color={cores.ouro} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={estilos.rolagem} showsVerticalScrollIndicator={false}>
      <View style={[estilos.coluna, { maxWidth: 1000 }]}>
        <Entrada>
          <View style={[estilos.hero, { minHeight: largo ? 340 : 300 }]}>
            <LinearGradient
              colors={[filme.corPrimaria, filme.corSecundaria]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            {imagemFilme(filme, 'banner') && (
              <Image
                source={{ uri: imagemFilme(filme, 'banner') }}
                resizeMode="cover"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                accessibilityLabel={`Imagem do filme ${filme.titulo}`}
              />
            )}
            <LinearGradient
              colors={['rgba(12,10,11,0.10)', 'rgba(12,10,11,0.72)', 'rgba(12,10,11,0.97)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={estilos.linhaBadge}>
              <View style={[estilos.classificacao, { backgroundColor: coresClassificacao[filme.classificacao] || '#333' }]}>
                <Text style={estilos.classificacaoTexto}>{filme.classificacao === 'A' ? '?' : filme.classificacao}</Text>
              </View>
              <Text style={estilos.genero}>
                {filme.genero.toUpperCase()} · {filme.ano}
              </Text>
            </View>
            <Text style={[estilos.titulo, { fontSize: largo ? 50 : 34, lineHeight: largo ? 56 : 38 }]}>{filme.titulo}</Text>
            <Text style={estilos.meta}>
              {filme.duracaoMin > 0 ? duracao(filme.duracaoMin) : 'Duração a definir'}
              {Number(filme.nota) > 0 ? `  ·  ★ ${Number(filme.nota).toFixed(1)}` : ''}
              {emPreVenda(filme) ? '  ·  Pré-venda' : estaEmBreve(filme) ? '  ·  Em breve' : ''}
            </Text>
          </View>
        </Entrada>

        <Entrada atraso={120}>
          <Text style={estilos.sinopse}>{filme.sinopse}</Text>
        </Entrada>

        <Text style={estilos.secao}>Sessões</Text>

        {dias.length === 0 ? (
          <Text style={estilos.vazio}>{emPreVenda(filme) ? 'Sessões de pré-venda indisponíveis no momento.' : estaEmBreve(filme) ? 'Estreia em breve. Sessões ainda não disponíveis.' : 'Nenhuma sessão disponível no momento.'}</Text>
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.dias}>
              {dias.map(([chave, lista]) => (
                <Toque
                  key={chave}
                  aoPressionar={() => setDia(chave)}
                  style={[estilos.dia, dia === chave && estilos.diaAtivo]}
                >
                  <Text style={[estilos.diaSemana, dia === chave && estilos.diaTextoAtivo]}>
                    {chave === hoje ? 'HOJE' : diaSemana(lista[0].inicio)}
                  </Text>
                  <Text style={[estilos.diaNumero, dia === chave && estilos.diaTextoAtivo]}>{diaMes(lista[0].inicio)}</Text>
                </Toque>
              ))}
            </ScrollView>

            <View key={dia} style={estilos.sessoes}>
              {doDia.map((s, i) => (
                <Entrada key={s.id} atraso={i * 80} deslocamento={12} duracao={350}>
                  <Toque
                    aoPressionar={() => navegar('Assentos', { sessaoId: s.id })}
                    style={estilos.sessao}
                    escalaPressionado={0.97}
                  >
                    <Text style={estilos.hora}>{hora(s.inicio)}</Text>
                    <View style={estilos.sessaoInfo}>
                      <Text style={estilos.formato}>{s.formato}</Text>
                      <Text style={estilos.sala}>{s.sala}</Text>
                    </View>
                    <Text style={estilos.preco}>{moeda(s.preco)}</Text>
                  </Toque>
                </Entrada>
              ))}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  erro: { color: cores.suave, fontSize: 15 },
  rolagem: { paddingBottom: 56, alignItems: 'center' },
  coluna: { width: '100%', paddingHorizontal: 20, paddingTop: 20 },
  hero: { borderRadius: 24, overflow: 'hidden', justifyContent: 'flex-end', padding: 28, gap: 10 },
  linhaBadge: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  classificacao: { width: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  classificacaoTexto: { color: '#fff', fontSize: 13, fontWeight: '800' },
  genero: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  titulo: { color: cores.texto, fontFamily: serifa, fontWeight: '700' },
  meta: { color: 'rgba(255,255,255,0.75)', fontSize: 14, letterSpacing: 0.4 },
  sinopse: { color: cores.suave, fontSize: 16, lineHeight: 25, marginTop: 22, maxWidth: 720 },
  secao: { color: cores.texto, fontFamily: serifa, fontSize: 26, fontWeight: '700', marginTop: 36, marginBottom: 14 },
  vazio: { color: cores.suave, fontSize: 15 },
  dias: { gap: 10, paddingBottom: 18 },
  dia: {
    width: 64,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  diaAtivo: { backgroundColor: cores.ouro, borderColor: cores.ouro },
  diaSemana: { color: cores.suave, fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  diaNumero: { color: cores.texto, fontSize: 22, fontWeight: '700' },
  diaTextoAtivo: { color: cores.ouroEscuro },
  sessoes: { gap: 10 },
  sessao: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    gap: 20,
  },
  hora: { color: cores.texto, fontFamily: serifa, fontSize: 28, fontWeight: '700', minWidth: 92 },
  sessaoInfo: { flex: 1, gap: 2 },
  formato: { color: cores.ouro, fontSize: 13, fontWeight: '800', letterSpacing: 1.5 },
  sala: { color: cores.suave, fontSize: 13 },
  preco: { color: cores.texto, fontSize: 16, fontWeight: '700' },
});

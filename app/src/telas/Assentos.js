import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../contexto';
import { criarPedido, obterSessao } from '../api';
import Assento from '../componentes/Assento';
import Botao from '../componentes/Botao';
import Entrada from '../componentes/Entrada';
import { cores, serifa } from '../tema';
import { dataLonga, hora, moeda, nativo } from '../utils';

export default function Assentos({ sessaoId }) {
  const { usuario, navegar } = useApp();
  const { width } = useWindowDimensions();
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');
  const [selecionados, setSelecionados] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const barra = useRef(new Animated.Value(0)).current;

  const carregar = useCallback(
    () =>
      obterSessao(sessaoId)
        .then(setDados)
        .catch(() => setErro('Não foi possível carregar a sala.')),
    [sessaoId]
  );

  useEffect(() => {
    carregar();
  }, [carregar]);

  const temSelecao = selecionados.length > 0;

  useEffect(() => {
    Animated.spring(barra, { toValue: temSelecao ? 1 : 0, useNativeDriver: nativo, bounciness: 5, speed: 14 }).start();
  }, [temSelecao]);

  const ocupados = useMemo(() => new Set(dados ? dados.ocupados : []), [dados]);

  const alternar = useCallback(
    (id) => {
      setErro('');
      setSelecionados((atual) => {
        if (atual.includes(id)) return atual.filter((a) => a !== id);
        if (atual.length >= 8) {
          setErro('O limite é de 8 ingressos por compra.');
          return atual;
        }
        return [...atual, id];
      });
    },
    []
  );

  const finalizar = async () => {
    if (!usuario) {
      navegar('Login', { retorno: true });
      return;
    }

    setEnviando(true);
    setErro('');
    try {
      const assentos = selecionados.map((id) => ({ fileira: id[0], numero: Number(id.slice(1)) }));
      const pedido = await criarPedido({ sessaoId: dados.id, assentos });
      navegar('Confirmacao', { pedido });
    } catch (e) {
      setErro(e.message);
      setSelecionados([]);
      await carregar();
    } finally {
      setEnviando(false);
    }
  };

  if (!dados) {
    return (
      <View style={estilos.centro}>
        {erro ? <Text style={estilos.erro}>{erro}</Text> : <ActivityIndicator size="large" color={cores.ouro} />}
      </View>
    );
  }

  const fileiras = Array.from({ length: dados.fileiras }, (_, i) => String.fromCharCode(65 + i));
  const colunas = Array.from({ length: dados.colunas }, (_, i) => i + 1);
  const corredor = 26;
  const disponivel = Math.min(width, 900) - 40 - 56;
  const tamanho = Math.max(20, Math.min(40, Math.floor((disponivel - corredor) / dados.colunas) - 6));
  const meio = Math.floor(dados.colunas / 2);
  const total = dados.preco * selecionados.length;

  return (
    <View style={estilos.tela}>
      <ScrollView contentContainerStyle={estilos.rolagem} showsVerticalScrollIndicator={false}>
        <View style={estilos.coluna}>
          <Entrada>
            <Text style={estilos.titulo}>{dados.filme.titulo}</Text>
            <Text style={estilos.sub}>
              {dados.sala} · {dados.formato} · {dataLonga(dados.inicio)} · {hora(dados.inicio)}
            </Text>
          </Entrada>

          <Entrada atraso={100} style={estilos.palco}>
            <LinearGradient
              colors={['rgba(217,164,65,0)', cores.ouro, 'rgba(217,164,65,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={estilos.tela2}
            />
            <LinearGradient colors={['rgba(217,164,65,0.22)', 'rgba(217,164,65,0)']} style={estilos.brilho} />
            <Text style={estilos.rotuloTela}>TELA</Text>
          </Entrada>

          <Entrada atraso={200} style={estilos.sala}>
            {fileiras.map((letra) => (
              <View key={letra} style={estilos.fileira}>
                <Text style={estilos.letra}>{letra}</Text>
                <View style={estilos.assentos}>
                  {colunas.map((n) => {
                    const id = `${letra}${n}`;
                    return (
                      <React.Fragment key={id}>
                        <Assento
                          tamanho={tamanho}
                          numero={n}
                          ocupado={ocupados.has(id)}
                          selecionado={selecionados.includes(id)}
                          aoPressionar={() => alternar(id)}
                        />
                        {n === meio && <View style={{ width: corredor }} />}
                      </React.Fragment>
                    );
                  })}
                </View>
                <Text style={estilos.letra}>{letra}</Text>
              </View>
            ))}
          </Entrada>

          <View style={estilos.legenda}>
            <View style={estilos.legendaItem}>
              <View style={[estilos.amostra, { backgroundColor: cores.superficie2, borderColor: cores.borda }]} />
              <Text style={estilos.legendaTexto}>Livre</Text>
            </View>
            <View style={estilos.legendaItem}>
              <View style={[estilos.amostra, { backgroundColor: cores.ouro, borderColor: cores.ouro }]} />
              <Text style={estilos.legendaTexto}>Selecionado</Text>
            </View>
            <View style={estilos.legendaItem}>
              <View style={[estilos.amostra, { backgroundColor: '#2a2224', borderColor: '#2a2224', opacity: 0.5 }]} />
              <Text style={estilos.legendaTexto}>Ocupado</Text>
            </View>
          </View>

          {!!erro && <Text style={estilos.erroLinha}>{erro}</Text>}
        </View>
      </ScrollView>

      <Animated.View
        pointerEvents={temSelecao ? 'auto' : 'none'}
        style={[
          estilos.barra,
          {
            opacity: barra,
            transform: [{ translateY: barra.interpolate({ inputRange: [0, 1], outputRange: [120, 0] }) }],
          },
        ]}
      >
        <View style={estilos.barraInfo}>
          <Text style={estilos.barraAssentos} numberOfLines={1}>
            {selecionados.length} {selecionados.length === 1 ? 'ingresso' : 'ingressos'} ·{' '}
            {[...selecionados].sort().join(', ')}
          </Text>
          <Text style={estilos.barraTotal}>{moeda(total)}</Text>
        </View>
        <Botao titulo={usuario ? 'Finalizar compra' : 'Entrar para comprar'} aoPressionar={finalizar} carregando={enviando} />
      </Animated.View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  erro: { color: cores.suave, fontSize: 15 },
  rolagem: { paddingBottom: 160, alignItems: 'center' },
  coluna: { width: '100%', maxWidth: 900, paddingHorizontal: 20, paddingTop: 24, alignItems: 'center' },
  titulo: { color: cores.texto, fontFamily: serifa, fontSize: 30, fontWeight: '700', textAlign: 'center' },
  sub: { color: cores.suave, fontSize: 14, marginTop: 6, textAlign: 'center' },
  palco: { width: '78%', marginTop: 32, alignItems: 'center' },
  tela2: { width: '100%', height: 4, borderRadius: 2 },
  brilho: { width: '100%', height: 38 },
  rotuloTela: { color: cores.suave, fontSize: 10, letterSpacing: 5, marginTop: 4 },
  sala: { marginTop: 22, alignItems: 'center' },
  fileira: { flexDirection: 'row', alignItems: 'center' },
  letra: { width: 24, textAlign: 'center', color: cores.suave, fontSize: 12, fontWeight: '700' },
  assentos: { flexDirection: 'row' },
  legenda: { flexDirection: 'row', gap: 22, marginTop: 30, flexWrap: 'wrap', justifyContent: 'center' },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  amostra: { width: 16, height: 16, borderRadius: 5, borderWidth: 1 },
  legendaTexto: { color: cores.suave, fontSize: 12 },
  erroLinha: { color: cores.erro, fontSize: 14, marginTop: 20, textAlign: 'center' },
  barra: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    padding: 14,
    paddingLeft: 20,
    borderRadius: 20,
    backgroundColor: cores.superficie2,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  barraInfo: { flex: 1, gap: 2 },
  barraAssentos: { color: cores.suave, fontSize: 13 },
  barraTotal: { color: cores.texto, fontFamily: serifa, fontSize: 24, fontWeight: '700' },
});

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Contexto } from './src/contexto';
import { definirToken } from './src/api';
import { cores } from './src/tema';
import Cabecalho from './src/componentes/Cabecalho';
import Entrada from './src/componentes/Entrada';
import Inicio from './src/telas/Inicio';
import Filme from './src/telas/Filme';
import Assentos from './src/telas/Assentos';
import Login from './src/telas/Login';
import Confirmacao from './src/telas/Confirmacao';
import Pedidos from './src/telas/Pedidos';
import Conta from './src/telas/Conta';
import Dashboard from './src/telas/Dashboard';

const telas = { Inicio, Filme, Assentos, Login, Confirmacao, Pedidos, Conta, Dashboard };
const CHAVE_SESSAO = 'cine_aurora_sessao';

const novaRota = (nome, params = {}) => ({ nome, params, chave: `${nome}-${Date.now()}-${Math.random()}` });

export default function App() {
  const [pilha, setPilha] = useState([novaRota('Inicio')]);
  const [sessao, setSessao] = useState(null);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(CHAVE_SESSAO)
      .then((valor) => {
        if (valor) {
          const salvo = JSON.parse(valor);
          definirToken(salvo.token);
          setSessao(salvo);
        }
      })
      .catch(() => {})
      .finally(() => setPronto(true));
  }, []);

  const navegar = useCallback((nome, params) => setPilha((p) => [...p, novaRota(nome, params)]), []);
  const voltar = useCallback(() => setPilha((p) => (p.length > 1 ? p.slice(0, -1) : p)), []);
  const raiz = useCallback((nome, params) => setPilha([novaRota(nome, params)]), []);

  const entrar = useCallback(async (dados) => {
    definirToken(dados.token);
    setSessao(dados);
    await AsyncStorage.setItem(CHAVE_SESSAO, JSON.stringify(dados));
  }, []);

  const sair = useCallback(async () => {
    definirToken(null);
    setSessao(null);
    await AsyncStorage.removeItem(CHAVE_SESSAO);
    setPilha([novaRota('Inicio')]);
  }, []);

  const topo = pilha[pilha.length - 1];
  const podeVoltar = pilha.length > 1 && !(topo.nome === 'Confirmacao' && !topo.params.consulta);

  const valor = useMemo(
    () => ({ usuario: sessao ? sessao.usuario : null, navegar, voltar, raiz, entrar, sair, podeVoltar, topo: topo.nome }),
    [sessao, navegar, voltar, raiz, entrar, sair, podeVoltar, topo.nome]
  );

  if (!pronto) return <View style={estilos.raiz} />;

  return (
    <Contexto.Provider value={valor}>
      <SafeAreaView style={estilos.raiz}>
        <StatusBar barStyle="light-content" backgroundColor={cores.fundo} />
        <Cabecalho />
        <View style={estilos.corpo}>
          {pilha.map((rota, indice) => {
            const Tela = telas[rota.nome];
            const ativa = indice === pilha.length - 1;
            return (
              <View key={rota.chave} style={[estilos.camada, !ativa && estilos.oculta]}>
                <Entrada style={estilos.camada} duracao={380} deslocamento={14}>
                  <Tela {...rota.params} />
                </Entrada>
              </View>
            );
          })}
        </View>
      </SafeAreaView>
    </Contexto.Provider>
  );
}

const estilos = StyleSheet.create({
  raiz: {
    flex: 1,
    backgroundColor: cores.fundo,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  corpo: { flex: 1 },
  camada: { flex: 1 },
  oculta: { display: 'none' },
});

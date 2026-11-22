import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../contexto';
import { meusPedidos } from '../api';
import Botao from '../componentes/Botao';
import Entrada from '../componentes/Entrada';
import Toque from '../componentes/Toque';
import { cores, serifa } from '../tema';
import { dataLonga, hora, moeda } from '../utils';

export default function Pedidos() {
  const { usuario, navegar } = useApp();
  const [pedidos, setPedidos] = useState(null);
  const [erro, setErro] = useState(false);

  const carregar = useCallback(() => {
    setErro(false);
    meusPedidos()
      .then(setPedidos)
      .catch(() => setErro(true));
  }, []);

  useEffect(() => {
    if (usuario) carregar();
  }, [usuario, carregar]);

  if (!usuario) {
    return (
      <View style={estilos.centro}>
        <Text style={estilos.vazioTitulo}>Entre para ver seus ingressos</Text>
        <Botao titulo="Entrar" aoPressionar={() => navegar('Login', { retorno: false })} style={{ marginTop: 18 }} />
      </View>
    );
  }

  if (erro) {
    return (
      <View style={estilos.centro}>
        <Text style={estilos.vazioTitulo}>Não foi possível carregar seus ingressos</Text>
        <Botao titulo="Tentar de novo" aoPressionar={carregar} tipo="contorno" style={{ marginTop: 18 }} />
      </View>
    );
  }

  if (!pedidos) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator size="large" color={cores.ouro} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={estilos.rolagem} showsVerticalScrollIndicator={false}>
      <View style={estilos.coluna}>
        <Text style={estilos.titulo}>Meus ingressos</Text>

        {pedidos.length === 0 ? (
          <Entrada style={estilos.vazio}>
            <Text style={estilos.vazioTitulo}>Nada por aqui ainda</Text>
            <Text style={estilos.vazioTexto}>Quando você comprar um ingresso, ele aparece nesta lista.</Text>
          </Entrada>
        ) : (
          pedidos.map((p, i) => (
            <Entrada key={p.id} atraso={Math.min(i * 90, 500)}>
              <Toque aoPressionar={() => navegar('Confirmacao', { pedido: p, consulta: true })} style={estilos.item} escalaPressionado={0.98}>
                <LinearGradient
                  colors={[p.corPrimaria, p.corSecundaria]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={estilos.faixa}
                />
                <View style={estilos.info}>
                  <Text style={estilos.filme} numberOfLines={1}>
                    {p.filme}
                  </Text>
                  <Text style={estilos.detalhe}>
                    {dataLonga(p.inicio)} · {hora(p.inicio)} · {p.sala} · {p.formato}
                  </Text>
                  <Text style={estilos.assentos}>Assentos {p.assentos.join(', ')}</Text>
                </View>
                <View style={estilos.direita}>
                  <Text style={estilos.total}>{moeda(p.total)}</Text>
                  <Text style={estilos.codigo}>{p.codigo}</Text>
                </View>
              </Toque>
            </Entrada>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  rolagem: { alignItems: 'center', paddingBottom: 56 },
  coluna: { width: '100%', maxWidth: 760, paddingHorizontal: 20, paddingTop: 24, gap: 12 },
  titulo: { color: cores.texto, fontFamily: serifa, fontSize: 30, fontWeight: '700', marginBottom: 8 },
  vazio: { paddingVertical: 40, alignItems: 'center' },
  vazioTitulo: { color: cores.texto, fontFamily: serifa, fontSize: 22, fontWeight: '700', textAlign: 'center' },
  vazioTexto: { color: cores.suave, fontSize: 14, marginTop: 8, textAlign: 'center' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    overflow: 'hidden',
    gap: 16,
    paddingRight: 18,
  },
  faixa: { width: 8, alignSelf: 'stretch' },
  info: { flex: 1, paddingVertical: 16, gap: 4 },
  filme: { color: cores.texto, fontFamily: serifa, fontSize: 19, fontWeight: '700' },
  detalhe: { color: cores.suave, fontSize: 13 },
  assentos: { color: cores.ouro, fontSize: 13, fontWeight: '700' },
  direita: { alignItems: 'flex-end', gap: 4 },
  total: { color: cores.texto, fontSize: 15, fontWeight: '700' },
  codigo: { color: cores.suave, fontSize: 11, letterSpacing: 2 },
});

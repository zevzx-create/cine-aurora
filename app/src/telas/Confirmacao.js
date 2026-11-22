import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../contexto';
import Bilhete from '../componentes/Bilhete';
import Botao from '../componentes/Botao';
import Entrada from '../componentes/Entrada';
import { cores, serifa } from '../tema';
import { nativo } from '../utils';

export default function Confirmacao({ pedido, consulta }) {
  const { raiz } = useApp();
  const escala = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!consulta) {
      Animated.spring(escala, { toValue: 1, delay: 150, useNativeDriver: nativo, bounciness: 14, speed: 9 }).start();
    }
  }, []);

  return (
    <ScrollView contentContainerStyle={estilos.rolagem} showsVerticalScrollIndicator={false}>
      {!consulta && (
        <View style={estilos.topo}>
          <Animated.View style={[estilos.selo, { transform: [{ scale: escala }] }]}>
            <Text style={estilos.check}>✓</Text>
          </Animated.View>
          <Entrada atraso={250}>
            <Text style={estilos.titulo}>Compra confirmada</Text>
            <Text style={estilos.sub}>Apresente o código abaixo na entrada da sala.</Text>
          </Entrada>
        </View>
      )}

      <Entrada atraso={consulta ? 0 : 450} deslocamento={30} duracao={600} style={estilos.bilhete}>
        <Bilhete pedido={pedido} />
      </Entrada>

      <Entrada atraso={consulta ? 150 : 800} style={estilos.acoes}>
        {consulta ? (
          <Botao titulo="Voltar aos meus ingressos" aoPressionar={() => raiz('Pedidos')} tipo="contorno" />
        ) : (
          <>
            <Botao titulo="Ver meus ingressos" aoPressionar={() => raiz('Pedidos')} />
            <Botao titulo="Voltar ao início" aoPressionar={() => raiz('Inicio')} tipo="contorno" />
          </>
        )}
      </Entrada>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  rolagem: { padding: 20, paddingBottom: 60, alignItems: 'center' },
  topo: { alignItems: 'center', marginTop: 12, marginBottom: 28 },
  selo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: cores.ouro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { color: cores.ouroEscuro, fontSize: 36, fontWeight: '800' },
  titulo: { color: cores.texto, fontFamily: serifa, fontSize: 30, fontWeight: '700', marginTop: 18, textAlign: 'center' },
  sub: { color: cores.suave, fontSize: 14, marginTop: 6, textAlign: 'center' },
  bilhete: { width: '100%', alignItems: 'center' },
  acoes: { marginTop: 28, gap: 12, width: '100%', maxWidth: 420 },
});

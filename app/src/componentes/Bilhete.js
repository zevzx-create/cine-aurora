import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cores, mono, serifa } from '../tema';
import { dataLonga, hora, moeda } from '../utils';

function Campo({ rotulo, valor }) {
  return (
    <View style={estilos.campo}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <Text style={estilos.valor}>{valor}</Text>
    </View>
  );
}

export default function Bilhete({ pedido }) {
  const barras = useMemo(
    () => pedido.codigo.split('').flatMap((c) => [2 + (c.charCodeAt(0) % 4), 2 + (c.charCodeAt(0) % 3)]),
    [pedido.codigo]
  );

  return (
    <View style={estilos.cartao}>
      <LinearGradient
        colors={[pedido.corPrimaria, pedido.corSecundaria]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={estilos.topo}
      >
        <Text style={estilos.etiqueta}>INGRESSO</Text>
        <Text style={estilos.titulo}>{pedido.filme}</Text>
      </LinearGradient>

      <View style={estilos.corpo}>
        <View style={estilos.linha}>
          <Campo rotulo="DATA" valor={dataLonga(pedido.inicio)} />
          <Campo rotulo="HORÁRIO" valor={hora(pedido.inicio)} />
        </View>
        <View style={estilos.linha}>
          <Campo rotulo="SALA" valor={pedido.sala} />
          <Campo rotulo="FORMATO" valor={pedido.formato} />
        </View>
        <View style={estilos.linha}>
          <Campo rotulo={pedido.assentos.length > 1 ? 'ASSENTOS' : 'ASSENTO'} valor={pedido.assentos.join(' · ')} />
          <Campo rotulo="TOTAL" valor={moeda(pedido.total)} />
        </View>
      </View>

      <View style={estilos.corte}>
        <View style={[estilos.entalhe, { left: -11 }]} />
        <View style={estilos.tracejado} />
        <View style={[estilos.entalhe, { right: -11 }]} />
      </View>

      <View style={estilos.rodape}>
        <View style={estilos.barras}>
          {barras.map((largura, i) => (
            <View
              key={i}
              style={{ width: largura, height: 46, backgroundColor: i % 2 === 0 ? cores.texto : 'transparent' }}
            />
          ))}
        </View>
        <Text style={estilos.codigo}>{pedido.codigo}</Text>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  topo: { padding: 22, gap: 6 },
  etiqueta: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', letterSpacing: 3 },
  titulo: { color: cores.texto, fontFamily: serifa, fontSize: 28, fontWeight: '700' },
  corpo: { padding: 22, gap: 18 },
  linha: { flexDirection: 'row', gap: 16 },
  campo: { flex: 1, gap: 4 },
  rotulo: { color: cores.suave, fontSize: 10, fontWeight: '700', letterSpacing: 1.8 },
  valor: { color: cores.texto, fontSize: 16, fontWeight: '600' },
  corte: { height: 22, justifyContent: 'center' },
  entalhe: { position: 'absolute', width: 22, height: 22, borderRadius: 11, backgroundColor: cores.fundo },
  tracejado: {
    marginHorizontal: 18,
    height: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: cores.borda,
    borderRadius: 1,
  },
  rodape: { padding: 22, alignItems: 'center', gap: 12 },
  barras: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', maxWidth: '100%' },
  codigo: { color: cores.suave, fontFamily: mono, fontSize: 15, letterSpacing: 5 },
});

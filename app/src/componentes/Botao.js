import React from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import Toque from './Toque';
import { cores } from '../tema';

export default function Botao({ titulo, aoPressionar, tipo = 'primario', desabilitado, carregando, style }) {
  const primario = tipo === 'primario';

  return (
    <Toque
      aoPressionar={aoPressionar}
      desabilitado={desabilitado || carregando}
      style={[estilos.base, primario ? estilos.primario : estilos.contorno, desabilitado && estilos.apagado, style]}
    >
      {carregando ? (
        <ActivityIndicator color={primario ? cores.ouroEscuro : cores.ouro} />
      ) : (
        <Text style={[estilos.texto, { color: primario ? cores.ouroEscuro : cores.ouro }]}>{titulo}</Text>
      )}
    </Toque>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: 50,
    paddingHorizontal: 26,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primario: { backgroundColor: cores.ouro },
  contorno: { borderWidth: 1.5, borderColor: cores.ouro },
  apagado: { opacity: 0.4 },
  texto: { fontSize: 15, fontWeight: '700', letterSpacing: 0.6 },
});

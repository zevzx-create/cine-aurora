import React, { useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Entrada from './Entrada';
import { cores, serifa } from '../tema';
import { duracao, nativo } from '../utils';
import { imagemFilme } from '../imagensFilmes';

export default function Poster({ filme, largura, atraso = 0, aoPressionar }) {
  const escala = useRef(new Animated.Value(1)).current;

  const mover = (para) =>
    Animated.spring(escala, { toValue: para, useNativeDriver: nativo, speed: 24, bounciness: 8 }).start();

  const altura = Math.round(largura * 1.5);
  const tamanhoTitulo = Math.max(16, Math.round(largura * 0.12));

  return (
    <Entrada atraso={atraso} style={{ width: largura }}>
      <Pressable
        onPress={aoPressionar}
        onPressIn={() => mover(0.97)}
        onPressOut={() => mover(1)}
        onHoverIn={() => mover(1.04)}
        onHoverOut={() => mover(1)}
      >
        <Animated.View style={[estilos.cartao, { width: largura, height: altura, transform: [{ scale: escala }] }]}>
          <LinearGradient
            colors={[filme.corPrimaria, filme.corSecundaria]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View
            style={[
              estilos.circulo,
              {
                width: largura * 0.95,
                height: largura * 0.95,
                borderRadius: largura * 0.475,
                top: -largura * 0.25,
                right: -largura * 0.3,
              },
            ]}
          />
          {imagemFilme(filme) && (
            <Image
              source={{ uri: imagemFilme(filme) }}
              resizeMode="cover"
              style={estilos.imagemFundo}
              accessibilityLabel={`Pôster de ${filme.titulo}`}
            />
          )}
          <LinearGradient colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.04)', 'rgba(0,0,0,0.92)']} style={estilos.sombra} />

          <View style={estilos.topo}>
            <Text style={estilos.genero}>{filme.genero.toUpperCase()}</Text>
            <View style={estilos.nota}>
              <Text style={estilos.notaTexto}>★ {Number(filme.nota).toFixed(1)}</Text>
            </View>
          </View>

          <View style={estilos.base}>
            <Text style={[estilos.titulo, { fontSize: tamanhoTitulo, lineHeight: tamanhoTitulo * 1.15 }]} numberOfLines={3}>
              {filme.titulo}
            </Text>
            <Text style={estilos.meta}>{duracao(filme.duracaoMin)}</Text>
          </View>
        </Animated.View>
      </Pressable>
    </Entrada>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: cores.superficie,
    justifyContent: 'space-between',
    padding: 14,
  },
  circulo: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.09)' },
  imagemFundo: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  sombra: { ...StyleSheet.absoluteFillObject },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  genero: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '700', letterSpacing: 1.6 },
  nota: { backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  notaTexto: { color: cores.ouro, fontSize: 11, fontWeight: '700' },
  base: { gap: 4 },
  titulo: { color: cores.texto, fontFamily: serifa, fontWeight: '700' },
  meta: { color: 'rgba(255,255,255,0.65)', fontSize: 11, letterSpacing: 0.4 },
});

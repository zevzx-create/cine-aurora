import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, Text } from 'react-native';
import { cores } from '../tema';

function Assento({ tamanho, ocupado, selecionado, numero, aoPressionar }) {
  const valor = useRef(new Animated.Value(selecionado ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(valor, { toValue: selecionado ? 1 : 0, useNativeDriver: false, bounciness: 14, speed: 16 }).start();
  }, [selecionado]);

  const fundo = valor.interpolate({ inputRange: [0, 1], outputRange: [cores.superficie2, cores.ouro] });
  const escala = valor.interpolate({ inputRange: [0, 1], outputRange: [1, 1.14] });

  return (
    <Pressable onPress={aoPressionar} disabled={ocupado} style={{ margin: 3 }}>
      <Animated.View
        style={{
          width: tamanho,
          height: tamanho,
          borderTopLeftRadius: tamanho * 0.45,
          borderTopRightRadius: tamanho * 0.45,
          borderBottomLeftRadius: tamanho * 0.18,
          borderBottomRightRadius: tamanho * 0.18,
          backgroundColor: ocupado ? '#2a2224' : fundo,
          borderWidth: 1,
          borderColor: ocupado ? '#2a2224' : selecionado ? cores.ouro : cores.borda,
          opacity: ocupado ? 0.5 : 1,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale: escala }],
        }}
      >
        {selecionado && tamanho >= 26 && (
          <Text style={{ color: cores.ouroEscuro, fontSize: 10, fontWeight: '800' }}>{numero}</Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

export default React.memo(Assento);

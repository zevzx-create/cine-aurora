import React, { useRef } from 'react';
import { Animated, Pressable } from 'react-native';
import { nativo } from '../utils';

export default function Toque({ children, aoPressionar, desabilitado, escalaPressionado = 0.96, style }) {
  const escala = useRef(new Animated.Value(1)).current;

  const ir = (para) =>
    Animated.spring(escala, { toValue: para, useNativeDriver: nativo, speed: 30, bounciness: 6 }).start();

  return (
    <Pressable
      onPress={aoPressionar}
      disabled={desabilitado}
      onPressIn={() => ir(escalaPressionado)}
      onPressOut={() => ir(1)}
    >
      <Animated.View style={[style, { transform: [{ scale: escala }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { nativo } from '../utils';

export default function Entrada({ children, atraso = 0, deslocamento = 18, duracao = 450, style }) {
  const valor = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(valor, {
      toValue: 1,
      duration: duracao,
      delay: atraso,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: nativo,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: valor,
          transform: [{ translateY: valor.interpolate({ inputRange: [0, 1], outputRange: [deslocamento, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

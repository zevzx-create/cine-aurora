import { Platform } from 'react-native';

export const cores = {
  fundo: '#0c0a0b',
  superficie: '#161214',
  superficie2: '#201a1d',
  borda: '#2e2528',
  texto: '#f4ede5',
  suave: '#a89c93',
  ouro: '#d9a441',
  ouroEscuro: '#1a1209',
  vinho: '#8f1d2c',
  erro: '#e5645a',
  ok: '#6fcf97',
};

export const serifa = Platform.select({
  web: 'Georgia, "Times New Roman", serif',
  ios: 'Georgia',
  default: 'serif',
});

export const mono = Platform.select({
  web: 'ui-monospace, Menlo, Consolas, monospace',
  ios: 'Menlo',
  default: 'monospace',
});

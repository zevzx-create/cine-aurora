import { Platform } from 'react-native';

export const nativo = Platform.OS !== 'web';

const dias = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const dois = (n) => String(n).padStart(2, '0');

export const hora = (v) => {
  const d = new Date(v);
  return `${dois(d.getHours())}:${dois(d.getMinutes())}`;
};

export const chaveDia = (v) => {
  const d = new Date(v);
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
};

export const diaSemana = (v) => dias[new Date(v).getDay()];
export const diaMes = (v) => dois(new Date(v).getDate());
export const dataCurta = (v) => {
  const d = new Date(v);
  return `${dois(d.getDate())} ${meses[d.getMonth()]}`;
};
export const dataLonga = (v) => `${diaSemana(v)}, ${dataCurta(v)}`;
export const moeda = (v) => `R$ ${Number(v).toFixed(2).replace('.', ',')}`;
export const duracao = (min) => `${Math.floor(min / 60)}h ${dois(min % 60)}min`;

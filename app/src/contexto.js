import { createContext, useContext } from 'react';

export const Contexto = createContext(null);

export const useApp = () => useContext(Contexto);

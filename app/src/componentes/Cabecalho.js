import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../contexto';
import Toque from './Toque';
import { cores, serifa } from '../tema';

export default function Cabecalho() {
  const { usuario, podeVoltar, voltar, raiz, navegar, sair, topo } = useApp();

  const abrirIngressos = () => {
    if (usuario) raiz('Pedidos');
    else navegar('Login', { retorno: false });
  };

  return (
    <View style={estilos.barra}>
      <View style={estilos.esquerda}>
        {podeVoltar && (
          <Toque aoPressionar={voltar} style={estilos.voltar}>
            <Text style={estilos.voltarTexto}>←</Text>
          </Toque>
        )}
        <Toque aoPressionar={() => raiz('Inicio')} escalaPressionado={0.97}>
          <Text style={estilos.logo}>
            CINE<Text style={estilos.logoOuro}> AURORA</Text>
          </Text>
        </Toque>
      </View>

      <View style={estilos.direita}>
        <Toque aoPressionar={() => raiz('Inicio')} style={estilos.link}>
          <Text style={[estilos.linkTexto, topo === 'Inicio' && estilos.linkAtivo]}>Filmes</Text>
        </Toque>
        <Toque aoPressionar={abrirIngressos} style={estilos.link}>
          <Text style={[estilos.linkTexto, topo === 'Pedidos' && estilos.linkAtivo]}>Ingressos</Text>
        </Toque>
        {usuario ? (
          <Toque aoPressionar={sair} style={estilos.conta}>
            <Text style={estilos.contaTexto}>{usuario.nome.split(' ')[0]} · Sair</Text>
          </Toque>
        ) : (
          <Toque aoPressionar={() => navegar('Login', { retorno: false })} style={estilos.conta}>
            <Text style={estilos.contaTexto}>Entrar</Text>
          </Toque>
        )}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
    backgroundColor: cores.fundo,
  },
  esquerda: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  direita: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  voltar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: cores.superficie2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voltarTexto: { color: cores.texto, fontSize: 18 },
  logo: { color: cores.texto, fontFamily: serifa, fontSize: 19, fontWeight: '700', letterSpacing: 3 },
  logoOuro: { color: cores.ouro },
  link: { paddingHorizontal: 10, paddingVertical: 8 },
  linkTexto: { color: cores.suave, fontSize: 14, fontWeight: '600' },
  linkAtivo: { color: cores.texto },
  conta: {
    marginLeft: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  contaTexto: { color: cores.ouro, fontSize: 13, fontWeight: '700' },
});

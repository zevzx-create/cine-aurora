import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../contexto';
import { excluirConta } from '../api';
import Botao from '../componentes/Botao';
import Toque from '../componentes/Toque';
import { cores, serifa } from '../tema';

export default function Conta() {
  const { usuario, sair, raiz } = useApp();
  const [confirmando, setConfirmando] = useState(false);
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState('');

  const excluir = async () => {
    if (excluindo) return;
    setErro('');

    if (!senha) {
      setErro('Digite sua senha para confirmar.');
      return;
    }
    if (confirmacao.trim().toUpperCase() !== 'EXCLUIR') {
      setErro('Digite EXCLUIR para confirmar a exclusão definitiva.');
      return;
    }

    setExcluindo(true);
    try {
      await excluirConta(senha);
      await sair();
    } catch (e) {
      setErro(e.message || 'Não foi possível excluir sua conta.');
    } finally {
      setExcluindo(false);
    }
  };

  if (!usuario) {
    return (
      <View style={estilos.centro}>
        <Text style={estilos.titulo}>Você precisa entrar na sua conta.</Text>
        <Botao titulo="Ver filmes" aoPressionar={() => raiz('Inicio')} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={estilos.rolagem} keyboardShouldPersistTaps="handled">
      <View style={estilos.cartao}>
        <Text style={estilos.titulo}>Minha conta</Text>
        <Text style={estilos.rotulo}>NOME</Text>
        <Text style={estilos.dado}>{usuario.nome}</Text>
        <Text style={estilos.rotulo}>E-MAIL</Text>
        <Text style={estilos.dado}>{usuario.email}</Text>

        <Botao titulo="Sair da conta" tipo="contorno" aoPressionar={sair} style={estilos.sair} />

        <View style={estilos.linha} />
        <Text style={estilos.subtitulo}>Excluir conta</Text>
        <Text style={estilos.aviso}>
          Esta ação é permanente. Seu cadastro, pedidos e ingressos serão apagados do sistema.
        </Text>

        {!confirmando ? (
          <Toque aoPressionar={() => { setErro(''); setConfirmando(true); }} style={estilos.botaoExcluir}>
            <Text style={estilos.textoExcluir}>Excluir minha conta</Text>
          </Toque>
        ) : (
          <View style={estilos.confirmacao}>
            <Text style={estilos.aviso}>
              Para confirmar, informe a senha da conta e digite EXCLUIR no campo abaixo.
            </Text>
            <Text style={estilos.rotulo}>SENHA ATUAL</Text>
            <TextInput
              value={senha}
              onChangeText={setSenha}
              placeholder="Sua senha"
              placeholderTextColor={cores.suave}
              secureTextEntry
              autoCapitalize="none"
              style={estilos.input}
              editable={!excluindo}
            />
            <Text style={estilos.rotulo}>DIGITE EXCLUIR</Text>
            <TextInput
              value={confirmacao}
              onChangeText={setConfirmacao}
              placeholder="EXCLUIR"
              placeholderTextColor={cores.suave}
              autoCapitalize="characters"
              style={estilos.input}
              editable={!excluindo}
            />
            {!!erro && <Text style={estilos.erro}>{erro}</Text>}
            <Toque
              desabilitado={excluindo}
              aoPressionar={excluir}
              style={[estilos.botaoExcluir, excluindo && estilos.desabilitado]}
            >
              <Text style={estilos.textoExcluir}>
                {excluindo ? 'Excluindo conta...' : 'Confirmar exclusão definitiva'}
              </Text>
            </Toque>
            <Toque
              desabilitado={excluindo}
              aoPressionar={() => { setConfirmando(false); setErro(''); setSenha(''); setConfirmacao(''); }}
              style={estilos.cancelar}
            >
              <Text style={estilos.cancelarTexto}>Cancelar</Text>
            </Toque>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  rolagem: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, padding: 24 },
  cartao: { width: '100%', maxWidth: 520, backgroundColor: cores.superficie,
    borderColor: cores.borda, borderWidth: 1, borderRadius: 24, padding: 28 },
  titulo: { color: cores.texto, fontFamily: serifa, fontSize: 30, fontWeight: '700', marginBottom: 22 },
  rotulo: { color: cores.suave, fontWeight: '700', letterSpacing: 1.5, fontSize: 11, marginTop: 14, marginBottom: 6 },
  dado: { color: cores.texto, fontSize: 16 },
  sair: { marginTop: 28 },
  linha: { borderTopColor: cores.borda, borderTopWidth: 1, marginTop: 30, marginBottom: 24 },
  subtitulo: { fontFamily: serifa, fontSize: 22, fontWeight: '700', color: cores.texto, marginBottom: 10 },
  aviso: { color: cores.suave, fontSize: 14, lineHeight: 21 },
  botaoExcluir: { marginTop: 22, borderRadius: 12, paddingHorizontal: 18, minHeight: 48,
    borderWidth: 1, borderColor: cores.erro, alignItems: 'center', justifyContent: 'center' },
  textoExcluir: { color: cores.erro, fontWeight: '700', fontSize: 14 },
  confirmacao: { marginTop: 14 },
  input: { backgroundColor: cores.superficie2, borderRadius: 12, color: cores.texto,
    borderColor: cores.borda, borderWidth: 1, paddingHorizontal: 14, height: 48 },
  erro: { marginTop: 12, color: cores.erro, fontSize: 14 },
  cancelar: { marginTop: 16, alignItems: 'center', padding: 12 },
  cancelarTexto: { color: cores.suave, fontWeight: '600' },
  desabilitado: { opacity: 0.5 },
});

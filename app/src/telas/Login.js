import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../contexto';
import { cadastrar, login } from '../api';
import Botao from '../componentes/Botao';
import Entrada from '../componentes/Entrada';
import Toque from '../componentes/Toque';
import { cores, serifa } from '../tema';

function Campo({ rotulo, ...props }) {
  const [foco, setFoco] = useState(false);

  return (
    <View style={estilos.campo}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <TextInput
        {...props}
        placeholderTextColor="#6d625c"
        onFocus={() => setFoco(true)}
        onBlur={() => setFoco(false)}
        style={[estilos.input, foco && estilos.inputFoco]}
      />
    </View>
  );
}

export default function Login({ retorno }) {
  const { entrar, voltar, raiz } = useApp();
  const [modo, setModo] = useState('entrar');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const novo = modo === 'criar';

  const enviar = async () => {
    setErro('');
    setCarregando(true);
    try {
      const dados = novo ? await cadastrar({ nome, email, senha }) : await login({ email, senha });
      await entrar(dados);
      if (retorno) voltar();
      else raiz('Inicio');
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={estilos.rolagem} keyboardShouldPersistTaps="handled">
      <View style={estilos.cartao}>
        <Entrada key={modo} deslocamento={10} duracao={320}>
          <Text style={estilos.titulo}>{novo ? 'Crie sua conta' : 'Bem-vindo de volta'}</Text>
          <Text style={estilos.sub}>
            {novo ? 'Leva menos de um minuto e seus ingressos ficam guardados.' : 'Entre para comprar e ver seus ingressos.'}
          </Text>

          <View style={estilos.form}>
            {novo && <Campo rotulo="NOME" value={nome} onChangeText={setNome} placeholder="Seu nome" autoCapitalize="words" />}
            <Campo
              rotulo="E-MAIL"
              value={email}
              onChangeText={setEmail}
              placeholder="voce@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Campo
              rotulo="SENHA"
              value={senha}
              onChangeText={setSenha}
              placeholder="Mínimo de 6 caracteres"
              secureTextEntry
              onSubmitEditing={enviar}
            />
          </View>

          {!!erro && <Text style={estilos.erro}>{erro}</Text>}

          <Botao
            titulo={novo ? 'Criar conta' : 'Entrar'}
            aoPressionar={enviar}
            carregando={carregando}
            style={{ marginTop: 22 }}
          />

          <Toque
            aoPressionar={() => {
              setErro('');
              setModo(novo ? 'entrar' : 'criar');
            }}
            style={estilos.alternar}
          >
            <Text style={estilos.alternarTexto}>
              {novo ? 'Já tenho conta. ' : 'Ainda não tenho conta. '}
              <Text style={estilos.alternarDestaque}>{novo ? 'Entrar' : 'Criar agora'}</Text>
            </Text>
          </Toque>
        </Entrada>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  rolagem: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  cartao: {
    width: '100%',
    maxWidth: 440,
    padding: 28,
    borderRadius: 24,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  titulo: { color: cores.texto, fontFamily: serifa, fontSize: 30, fontWeight: '700' },
  sub: { color: cores.suave, fontSize: 14, lineHeight: 21, marginTop: 8 },
  form: { marginTop: 26, gap: 16 },
  campo: { gap: 7 },
  rotulo: { color: cores.suave, fontSize: 10, fontWeight: '700', letterSpacing: 1.8 },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    color: cores.texto,
    fontSize: 16,
    backgroundColor: cores.superficie2,
    borderWidth: 1.5,
    borderColor: cores.borda,
    ...Platform.select({ web: { outlineStyle: 'none' }, default: {} }),
  },
  inputFoco: { borderColor: cores.ouro },
  erro: { color: cores.erro, fontSize: 14, marginTop: 16 },
  alternar: { marginTop: 20, alignItems: 'center', paddingVertical: 6 },
  alternarTexto: { color: cores.suave, fontSize: 14 },
  alternarDestaque: { color: cores.ouro, fontWeight: '700' },
});

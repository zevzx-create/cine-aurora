import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useApp } from '../contexto';
import { resumoAdmin } from '../api';
import Botao from '../componentes/Botao';
import Entrada from '../componentes/Entrada';
import { cores, serifa } from '../tema';
import { moeda } from '../utils';

const inteiro = (n) => Number(n || 0).toLocaleString('pt-BR');
const dataPedido = (valor) => {
  if (!valor) return '—';
  const partes = String(valor).split('T');
  const dia = partes[0]?.split('-').reverse().join('/') || '';
  return dia + (partes[1] ? ' · ' + partes[1].slice(0, 5) : '');
};

function Indicador({ titulo, valor, detalhe, largura }) {
  return (
    <View style={[estilos.indicador, { width: largura }]}>
      <Text style={estilos.indicadorRotulo}>{titulo}</Text>
      <Text style={estilos.indicadorNumero} numberOfLines={1} adjustsFontSizeToFit>{valor}</Text>
      <Text style={estilos.indicadorDetalhe}>{detalhe}</Text>
    </View>
  );
}

export default function Dashboard() {
  const { usuario, raiz, navegar } = useApp();
  const { width } = useWindowDimensions();
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      setDados(await resumoAdmin());
    } catch (falha) {
      setErro(falha.message || 'Não foi possível carregar os indicadores.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (usuario?.isAdmin) carregar();
    else setCarregando(false);
  }, [usuario?.isAdmin, carregar]);

  if (!usuario?.isAdmin) {
    return (
      <View style={estilos.centro}>
        <Text style={estilos.titulo}>Área administrativa</Text>
        <Text style={estilos.suave}>Acesso exclusivo para administradores autorizados.</Text>
        <Botao titulo="Voltar aos filmes" aoPressionar={() => raiz('Inicio')} />
      </View>
    );
  }

  if (carregando && !dados) {
    return <View style={estilos.centro}><ActivityIndicator size="large" color={cores.ouro} /><Text style={estilos.suave}>Carregando dados do MySQL...</Text></View>;
  }

  if (erro && !dados) {
    return (
      <View style={estilos.centro}>
        <Text style={estilos.titulo}>Não foi possível abrir o painel</Text>
        <Text style={[estilos.suave, { textAlign: 'center' }]}>{erro}</Text>
        <Botao titulo="Tentar novamente" aoPressionar={carregar} />
      </View>
    );
  }

  const indicadores = dados?.indicadores || {};
  const maisVendidos = dados?.maisVendidos || [];
  const ultimosPedidos = dados?.ultimosPedidos || [];
  const maior = Math.max(...maisVendidos.map((item) => Number(item.ingressos)), 1);
  const larguraCartao = width >= 1000 ? '23.4%' : width >= 600 ? '48.3%' : '47.5%';
  const compacto = width < 620;

  return (
    <ScrollView contentContainerStyle={estilos.rolagem} showsVerticalScrollIndicator={false}>
      <View style={estilos.coluna}>
        <Entrada style={estilos.topo}>
          <View style={estilos.tituloArea}>
            <Text style={estilos.etiqueta}>CINE AURA / ADMINISTRAÇÃO</Text>
            <Text style={estilos.titulo}>Dashboard</Text>
            <Text style={estilos.suave}>Visão geral dos dados registrados no sistema.</Text>
          </View>
          <View style={estilos.atualizar}>
            <Botao titulo={carregando ? 'Atualizando...' : 'Atualizar dados'} aoPressionar={carregar} carregando={carregando} tipo="contorno" />
          </View>
        </Entrada>

        <Entrada style={estilos.gerenciar}>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={estilos.secaoTitulo}>Gerenciar cinema</Text>
            <Text style={estilos.suave}>Cadastre filmes, edite o catálogo, crie sessões e altere preços no MySQL.</Text>
          </View>
          <Botao titulo="Gerenciar filmes e sessões" aoPressionar={() => navegar('GerenciarCatalogo')} />
        </Entrada>

        {!!erro && <Text style={estilos.aviso}>{erro} Os valores exibidos podem estar desatualizados.</Text>}

        <Entrada atraso={80} style={estilos.gradeIndicadores}>
          <Indicador titulo="FATURAMENTO" valor={moeda(indicadores.faturamento)} detalhe="Total dos pedidos de teste" largura={larguraCartao} />
          <Indicador titulo="INGRESSOS" valor={inteiro(indicadores.ingressos)} detalhe="Assentos vendidos" largura={larguraCartao} />
          <Indicador titulo="PEDIDOS" valor={inteiro(indicadores.pedidos)} detalhe="Compras registradas" largura={larguraCartao} />
          <Indicador titulo="USUÁRIOS" valor={inteiro(indicadores.usuarios)} detalhe="Contas cadastradas" largura={larguraCartao} />
        </Entrada>

        <Entrada atraso={140} style={estilos.grupo}>
          <View style={estilos.caixaPrincipal}>
            <View style={estilos.cabecalhoSecao}>
              <View>
                <Text style={estilos.secaoTitulo}>Filmes mais vendidos</Text>
                <Text style={estilos.suave}>Ranking por quantidade de ingressos</Text>
              </View>
              <Text style={estilos.rotuloDestaque}>{inteiro(indicadores.filmes)} EM CARTAZ</Text>
            </View>

            {maisVendidos.length === 0 ? (
              <Text style={estilos.vazio}>Ainda não há ingressos vendidos.</Text>
            ) : (
              maisVendidos.map((item, indice) => (
                <View key={item.filme + indice} style={estilos.linhaGrafico}>
                  <View style={estilos.linhaDetalhe}>
                    <Text style={estilos.filmeNome} numberOfLines={2}>{indice + 1}. {item.filme}</Text>
                    <Text style={estilos.quantidade}>{inteiro(item.ingressos)} {Number(item.ingressos) === 1 ? 'ingresso' : 'ingressos'}</Text>
                  </View>
                  <View style={estilos.trilho}>
                    <View style={[estilos.barra, { width: Math.max(3, Math.round(Number(item.ingressos) / maior * 100)) + '%' }]} />
                  </View>
                  <Text style={estilos.receitaFilme}>Receita registrada: {moeda(item.faturamento)}</Text>
                </View>
              ))
            )}
          </View>
        </Entrada>

        <Entrada atraso={200} style={estilos.caixaPrincipal}>
          <View style={estilos.cabecalhoSecao}>
            <View>
              <Text style={estilos.secaoTitulo}>Compras recentes</Text>
              <Text style={estilos.suave}>Últimos pedidos gravados no MySQL</Text>
            </View>
            <Text style={estilos.rotuloDestaque}>{ultimosPedidos.length} REGISTROS</Text>
          </View>
          {ultimosPedidos.length === 0 ? (
            <Text style={estilos.vazio}>Nenhuma compra registrada até agora.</Text>
          ) : (
            ultimosPedidos.map((pedido) => (
              <View key={pedido.codigo} style={[estilos.pedidoLinha, compacto && estilos.pedidoLinhaCompacto]}>
                <View style={estilos.pedidoEsquerda}>
                  <Text style={estilos.codigo}>{pedido.codigo}</Text>
                  <Text style={estilos.pedidoFilme} numberOfLines={2}>{pedido.filme}</Text>
                  <Text style={estilos.pedidoMeta}>{dataPedido(pedido.criadoEm)} · {inteiro(pedido.ingressos)} {Number(pedido.ingressos) === 1 ? 'ingresso' : 'ingressos'}</Text>
                </View>
                <Text style={estilos.pedidoTotal}>{moeda(pedido.total)}</Text>
              </View>
            ))
          )}
        </Entrada>

        <Text style={estilos.rodape}>
          Painel administrativo de demonstração. Os valores representam pedidos registrados no banco, não pagamentos processados por uma operadora.
        </Text>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  rolagem: { alignItems: 'center', paddingBottom: 60 },
  coluna: { width: '100%', maxWidth: 1220, paddingHorizontal: 20, paddingTop: 30, gap: 22 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18, padding: 26 },
  topo: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, paddingBottom: 12 },
  tituloArea: { flex: 1, minWidth: 180 },
  etiqueta: { color: cores.ouro, fontSize: 10, fontWeight: '800', letterSpacing: 2.2, marginBottom: 12 },
  titulo: { color: cores.texto, fontFamily: serifa, fontSize: 42, fontWeight: '700', marginBottom: 8 },
  suave: { color: cores.suave, fontSize: 13, lineHeight: 20 },
  atualizar: { minWidth: 160 },
  aviso: { color: cores.erro, fontSize: 13 },
  gradeIndicadores: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14 },
  indicador: { minHeight: 140, backgroundColor: cores.superficie, padding: 18, borderRadius: 16, borderWidth: 1, borderColor: cores.borda, justifyContent: 'space-between', gap: 10 },
  indicadorRotulo: { color: cores.suave, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  indicadorNumero: { color: cores.ouro, fontFamily: serifa, fontSize: 27, fontWeight: '700' },
  indicadorDetalhe: { color: cores.suave, fontSize: 11, lineHeight: 15 },
  grupo: { width: '100%' },
  caixaPrincipal: { width: '100%', padding: 22, borderRadius: 18, borderWidth: 1, borderColor: cores.borda, backgroundColor: cores.superficie, gap: 18 },
  cabecalhoSecao: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 },
  secaoTitulo: { color: cores.texto, fontFamily: serifa, fontWeight: '700', fontSize: 24, marginBottom: 6 },
  rotuloDestaque: { color: cores.ouro, backgroundColor: cores.superficie2, padding: 10, borderRadius: 8, overflow: 'hidden', fontWeight: '800', fontSize: 10, letterSpacing: 1 },
  linhaGrafico: { gap: 8, paddingBottom: 8 },
  linhaDetalhe: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  filmeNome: { color: cores.texto, fontWeight: '600', fontSize: 14, flex: 1 },
  quantidade: { color: cores.ouro, fontSize: 12, fontWeight: '700' },
  trilho: { height: 9, width: '100%', borderRadius: 5, backgroundColor: cores.superficie2, overflow: 'hidden' },
  barra: { height: '100%', borderRadius: 5, backgroundColor: cores.ouro },
  receitaFilme: { fontSize: 11, color: cores.suave },
  pedidoLinha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 18, borderTopWidth: 1, borderTopColor: cores.borda, paddingTop: 16 },
  pedidoLinhaCompacto: { alignItems: 'flex-start' },
  pedidoEsquerda: { flex: 1, gap: 5 },
  codigo: { color: cores.ouro, fontSize: 10, fontWeight: '800', letterSpacing: 1.3 },
  pedidoFilme: { color: cores.texto, fontWeight: '600', fontSize: 15 },
  pedidoMeta: { color: cores.suave, fontSize: 12 },
  pedidoTotal: { color: cores.texto, fontWeight: '700', fontSize: 16 },
  vazio: { color: cores.suave, fontSize: 14, paddingVertical: 24, textAlign: 'center' },
  gerenciar: { padding: 20, backgroundColor: cores.superficie, borderRadius: 16, borderWidth: 1, borderColor: cores.ouro, gap: 16, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' },
  rodape: { color: cores.suave, fontSize: 12, lineHeight: 19, textAlign: 'center', marginTop: 4 },
});

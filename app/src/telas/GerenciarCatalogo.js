import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useApp } from '../contexto';
import {
  listarFilmesAdmin, criarFilmeAdmin, editarFilmeAdmin, removerFilmeAdmin,
  listarSalasAdmin, listarSessoesAdmin, criarSessaoAdmin, editarSessaoAdmin, removerSessaoAdmin
} from '../api';
import Botao from '../componentes/Botao';
import Toque from '../componentes/Toque';
import { cores, serifa } from '../tema';
import { moeda } from '../utils';

const classificacoes = ['L', '10', '12', '14', '16', '18', 'A'];
const formatos = ['2D', '3D', 'IMAX', 'VIP'];
const anoAtual = new Date().getFullYear();
const novoFilme = () => ({
  titulo: '', sinopse: '', genero: '', duracaoMin: '120',
  classificacao: '12', nota: '0', ano: String(anoAtual),
  corPrimaria: '#263443', corSecundaria: '#c59e64',
  posterUrl: '', bannerUrl: '', emCartaz: true
});
const filmeParaFormulario = (f) => ({
  titulo: f.titulo || '',
  sinopse: f.sinopse || '',
  genero: f.genero || '',
  duracaoMin: String(f.duracaoMin ?? 0),
  classificacao: f.classificacao || '12',
  nota: String(f.nota ?? 0),
  ano: String(f.ano ?? anoAtual),
  corPrimaria: f.corPrimaria || '#263443',
  corSecundaria: f.corSecundaria || '#c59e64',
  posterUrl: f.posterUrl || '',
  bannerUrl: f.bannerUrl || '',
  emCartaz: !!f.emCartaz
});
const amanha = () => {
  const data = new Date();
  data.setDate(data.getDate() + 1);
  return [
    data.getFullYear(), '-', String(data.getMonth() + 1).padStart(2, '0'), '-',
    String(data.getDate()).padStart(2, '0'), 'T19:00'
  ].join('');
};
const novaSessao = (filmeId = 0, salaId = 0) => ({
  filmeId, salaId, inicio: amanha(), preco: '32,00', formato: '2D'
});
const numero = (n) => Number(String(n).trim().replace(',', '.'));
const dataHora = (d) => {
  if (!d) return '—';
  const [data, hora] = String(d).split('T');
  return (data ? data.split('-').reverse().join('/') : '') + ' ' + (hora || '').slice(0, 5);
};

function Campo({ titulo, valor, aoMudar, multi = false, placeholder, largura }) {
  return (
    <View style={[estilos.campo, largura ? { width: largura } : null]}>
      <Text style={estilos.rotulo}>{titulo}</Text>
      <TextInput
        value={valor}
        onChangeText={aoMudar}
        placeholder={placeholder || titulo}
        placeholderTextColor={cores.suave}
        autoCapitalize="none"
        multiline={multi}
        numberOfLines={multi ? 4 : 1}
        style={[estilos.entrada, multi && estilos.entradaGrande]}
      />
    </View>
  );
}

function Opcoes({ titulo, opcoes, escolhido, aoEscolher, rolavel = false }) {
  const filhos = opcoes.map((o) => (
    <Toque key={String(o.valor)} aoPressionar={() => aoEscolher(o.valor)}
      style={[estilos.opcao, escolhido === o.valor && estilos.opcaoAtiva]}>
      <Text style={[estilos.opcaoTexto, escolhido === o.valor && estilos.opcaoTextoAtivo]} numberOfLines={1}>
        {o.rotulo}
      </Text>
    </Toque>
  ));
  return (
    <View style={estilos.campo}>
      <Text style={estilos.rotulo}>{titulo}</Text>
      {rolavel ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.opcoes}>{filhos}</ScrollView>
      ) : <View style={estilos.opcoes}>{filhos}</View>}
    </View>
  );
}

export default function GerenciarCatalogo() {
  const { usuario, raiz } = useApp();
  const { width } = useWindowDimensions();
  const mobile = width < 720;
  const [aba, setAba] = useState('filmes');
  const [filmes, setFilmes] = useState([]);
  const [salas, setSalas] = useState([]);
  const [filmeId, setFilmeId] = useState(null);
  const [sessoes, setSessoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoSessoes, setCarregandoSessoes] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [editandoFilme, setEditandoFilme] = useState(null);
  const [confirmandoFilme, setConfirmandoFilme] = useState(null);
  const [formFilme, setFormFilme] = useState(novoFilme);
  const [editandoSessao, setEditandoSessao] = useState(null);
  const [confirmandoSessao, setConfirmandoSessao] = useState(null);
  const [formSessao, setFormSessao] = useState(() => novaSessao());

  const mensagem = (texto, falha = false) => {
    setErro(falha ? texto : '');
    setSucesso(falha ? '' : texto);
  };

  const atualizarFilmes = useCallback(async () => {
    const lista = await listarFilmesAdmin();
    setFilmes(lista);
    return lista;
  }, []);

  const carregarTudo = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const [lista, salasDisponiveis] = await Promise.all([atualizarFilmes(), listarSalasAdmin()]);
      setSalas(salasDisponiveis);
      const primeiro = lista.find(f => f.emCartaz)?.id || lista[0]?.id || null;
      setFilmeId(anterior => anterior && lista.some(f => f.id === anterior) ? anterior : primeiro);
      setFormSessao(anterior => ({
        ...anterior,
        filmeId: anterior.filmeId || primeiro || 0,
        salaId: anterior.salaId || salasDisponiveis[0]?.id || 0
      }));
    } catch (e) {
      mensagem(e.message || 'Não foi possível carregar o catálogo.', true);
    } finally {
      setCarregando(false);
    }
  }, [atualizarFilmes]);

  useEffect(() => {
    if (usuario?.isAdmin) carregarTudo();
    else setCarregando(false);
  }, [usuario?.isAdmin, carregarTudo]);

  const atualizarSessoes = useCallback(async (id) => {
    if (!id) { setSessoes([]); return; }
    setCarregandoSessoes(true);
    try {
      const lista = await listarSessoesAdmin(id);
      setSessoes(lista);
    } catch (e) {
      mensagem(e.message || 'Falha ao consultar sessões.', true);
    } finally {
      setCarregandoSessoes(false);
    }
  }, []);

  useEffect(() => {
    if (usuario?.isAdmin && filmeId) atualizarSessoes(filmeId);
  }, [usuario?.isAdmin, filmeId, atualizarSessoes]);

  const mudarFilme = (campo, valor) => setFormFilme(atual => ({ ...atual, [campo]: valor }));
  const mudarSessao = (campo, valor) => setFormSessao(atual => ({ ...atual, [campo]: valor }));

  const editarFilme = (filme) => {
    setEditandoFilme(filme.id);
    setFormFilme(filmeParaFormulario(filme));
    setConfirmandoFilme(null);
    setErro('');
    setSucesso('');
  };

  const limparFilme = () => {
    setEditandoFilme(null);
    setFormFilme(novoFilme());
    setConfirmandoFilme(null);
  };

  const salvarFilme = async () => {
    const titulo = formFilme.titulo.trim();
    if (!titulo || !formFilme.sinopse.trim() || !formFilme.genero.trim()) {
      mensagem('Preencha título, gênero e sinopse.', true);
      return;
    }
    const payload = {
      ...formFilme,
      titulo, sinopse: formFilme.sinopse.trim(), genero: formFilme.genero.trim(),
      duracaoMin: Number(formFilme.duracaoMin),
      nota: numero(formFilme.nota),
      ano: Number(formFilme.ano),
      posterUrl: formFilme.posterUrl.trim() || null,
      bannerUrl: formFilme.bannerUrl.trim() || null
    };
    if (!Number.isFinite(payload.duracaoMin) || !Number.isFinite(payload.nota) || !Number.isFinite(payload.ano)) {
      mensagem('Confira os campos numéricos de duração, nota e ano.', true);
      return;
    }
    setSalvando(true);
    try {
      if (editandoFilme) await editarFilmeAdmin(editandoFilme, payload);
      else await criarFilmeAdmin(payload);
      await atualizarFilmes();
      mensagem(editandoFilme ? 'Filme atualizado no MySQL.' : 'Filme cadastrado no MySQL.');
      limparFilme();
    } catch (e) {
      mensagem(e.message, true);
    } finally { setSalvando(false); }
  };

  const excluirFilme = async (id) => {
    setSalvando(true);
    try {
      await removerFilmeAdmin(id);
      await atualizarFilmes();
      limparFilme();
      mensagem('Filme retirado do catálogo. Os pedidos anteriores foram preservados.');
    } catch (e) { mensagem(e.message, true); }
    finally { setSalvando(false); setConfirmandoFilme(null); }
  };

  const novoFormularioSessao = (id = filmeId) => {
    setEditandoSessao(null);
    setConfirmandoSessao(null);
    setFormSessao(novaSessao(id || 0, salas[0]?.id || 0));
  };

  const editarSessao = (sessao) => {
    setEditandoSessao(sessao.id);
    setConfirmandoSessao(null);
    setFormSessao({
      filmeId: sessao.filmeId, salaId: sessao.salaId,
      inicio: String(sessao.inicio).slice(0, 16),
      preco: String(sessao.preco).replace('.', ','), formato: sessao.formato
    });
    setErro('');
    setSucesso('');
  };

  const salvarSessao = async () => {
    const payload = {
      filmeId: Number(formSessao.filmeId), salaId: Number(formSessao.salaId),
      inicio: formSessao.inicio.trim(), preco: numero(formSessao.preco),
      formato: formSessao.formato
    };
    if (!payload.filmeId || !payload.salaId || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(payload.inicio) ||
        !Number.isFinite(payload.preco) || payload.preco <= 0) {
      mensagem('Informe filme, sala, data no formato AAAA-MM-DDTHH:MM e preço maior que zero.', true);
      return;
    }
    setSalvando(true);
    try {
      if (editandoSessao) await editarSessaoAdmin(editandoSessao, payload);
      else await criarSessaoAdmin(payload);
      setFilmeId(payload.filmeId);
      await atualizarSessoes(payload.filmeId);
      novoFormularioSessao(payload.filmeId);
      mensagem(editandoSessao ? 'Sessão e preço atualizados no MySQL.' : 'Sessão cadastrada no MySQL.');
    } catch (e) { mensagem(e.message, true); }
    finally { setSalvando(false); }
  };

  const excluirSessao = async (id) => {
    setSalvando(true);
    try {
      await removerSessaoAdmin(id);
      await atualizarSessoes(filmeId);
      if (editandoSessao === id) novoFormularioSessao();
      mensagem('Sessão removida do MySQL.');
    } catch (e) { mensagem(e.message, true); }
    finally { setSalvando(false); setConfirmandoSessao(null); }
  };

  if (!usuario?.isAdmin) {
    return <View style={estilos.centro}>
      <Text style={estilos.titulo}>Acesso restrito</Text>
      <Text style={estilos.suave}>Somente o administrador pode alterar o banco de dados.</Text>
      <Botao titulo="Voltar ao início" aoPressionar={() => raiz('Inicio')} />
    </View>;
  }

  if (carregando) {
    return <View style={estilos.centro}>
      <ActivityIndicator size="large" color={cores.ouro} />
      <Text style={estilos.suave}>Consultando filmes e salas no MySQL...</Text>
    </View>;
  }

  return (
    <ScrollView contentContainerStyle={estilos.rolagem} keyboardShouldPersistTaps="handled">
      <View style={estilos.coluna}>
        <View style={estilos.topo}>
          <View style={{ flex: 1 }}>
            <Text style={estilos.etiqueta}>CINE AURA / ADMINISTRAÇÃO</Text>
            <Text style={estilos.titulo}>Gerenciar catálogo</Text>
            <Text style={estilos.suave}>Adicione, edite e retire filmes. Gerencie sessões e preços direto no MySQL.</Text>
          </View>
          <Botao titulo="Voltar ao painel" tipo="contorno" aoPressionar={() => raiz('Dashboard')} />
        </View>

        <View style={estilos.abas}>
          <Toque aoPressionar={() => { setAba('filmes'); setErro(''); setSucesso(''); }}
            style={[estilos.aba, aba === 'filmes' && estilos.abaAtiva]}>
            <Text style={[estilos.abaTexto, aba === 'filmes' && estilos.abaTextoAtivo]}>Filmes</Text>
          </Toque>
          <Toque aoPressionar={() => { setAba('sessoes'); setErro(''); setSucesso(''); }}
            style={[estilos.aba, aba === 'sessoes' && estilos.abaAtiva]}>
            <Text style={[estilos.abaTexto, aba === 'sessoes' && estilos.abaTextoAtivo]}>Sessões e preços</Text>
          </Toque>
          <Toque aoPressionar={carregarTudo} style={estilos.recarregar}>
            <Text style={estilos.recarregarTexto}>↻ Atualizar</Text>
          </Toque>
        </View>

        {!!erro && <View style={estilos.avisoErro}><Text style={estilos.avisoErroTexto}>{erro}</Text></View>}
        {!!sucesso && <View style={estilos.avisoSucesso}><Text style={estilos.avisoSucessoTexto}>{sucesso}</Text></View>}

        {aba === 'filmes' ? (
          <>
            <View style={estilos.cartao}>
              <Text style={estilos.secao}>{editandoFilme ? 'Editar filme #' + editandoFilme : 'Cadastrar novo filme'}</Text>
              <View style={[estilos.campos, { flexDirection: mobile ? 'column' : 'row' }]}>
                <Campo titulo="Título do filme" valor={formFilme.titulo} aoMudar={v => mudarFilme('titulo', v)} largura={mobile ? '100%' : '65%'} />
                <Campo titulo="Gênero" valor={formFilme.genero} aoMudar={v => mudarFilme('genero', v)} largura={mobile ? '100%' : '32%'} />
              </View>
              <Campo titulo="Sinopse" valor={formFilme.sinopse} aoMudar={v => mudarFilme('sinopse', v)} multi />
              <View style={[estilos.campos, { flexDirection: mobile ? 'column' : 'row' }]}>
                <Campo titulo="Duração (minutos)" valor={formFilme.duracaoMin} aoMudar={v => mudarFilme('duracaoMin', v)} largura={mobile ? '100%' : '32%'} />
                <Campo titulo="Ano" valor={formFilme.ano} aoMudar={v => mudarFilme('ano', v)} largura={mobile ? '100%' : '32%'} />
                <Campo titulo="Nota (0 a 10)" valor={formFilme.nota} aoMudar={v => mudarFilme('nota', v)} largura={mobile ? '100%' : '32%'} />
              </View>
              <Opcoes titulo="Classificação indicativa" opcoes={classificacoes.map(v => ({ valor: v, rotulo: v }))}
                escolhido={formFilme.classificacao} aoEscolher={v => mudarFilme('classificacao', v)} />
              <View style={[estilos.campos, { flexDirection: mobile ? 'column' : 'row' }]}>
                <Campo titulo="Cor principal (#RRGGBB)" valor={formFilme.corPrimaria} aoMudar={v => mudarFilme('corPrimaria', v)} largura={mobile ? '100%' : '49%'} />
                <Campo titulo="Cor secundária (#RRGGBB)" valor={formFilme.corSecundaria} aoMudar={v => mudarFilme('corSecundaria', v)} largura={mobile ? '100%' : '49%'} />
              </View>
              <Campo titulo="URL do pôster (https://...)" valor={formFilme.posterUrl} aoMudar={v => mudarFilme('posterUrl', v)} />
              <Campo titulo="URL do banner (opcional)" valor={formFilme.bannerUrl} aoMudar={v => mudarFilme('bannerUrl', v)} />
              <Opcoes titulo="Situação no catálogo" opcoes={[{ valor: true, rotulo: 'Em cartaz' }, { valor: false, rotulo: 'Oculto' }]}
                escolhido={formFilme.emCartaz} aoEscolher={v => mudarFilme('emCartaz', v)} />
              <View style={estilos.acoes}>
                <Botao titulo={editandoFilme ? 'Salvar alterações no MySQL' : 'Cadastrar filme no MySQL'} aoPressionar={salvarFilme} carregando={salvando} />
                {editandoFilme && <Botao titulo="Cancelar edição" tipo="contorno" aoPressionar={limparFilme} />}
              </View>
            </View>

            <View style={estilos.cartao}>
              <Text style={estilos.secao}>Filmes cadastrados ({filmes.length})</Text>
              <Text style={estilos.suave}>Retirar oculta o filme do catálogo, sem apagar compras antigas. Edite o filme para reativá-lo.</Text>
              {filmes.length === 0 && <Text style={estilos.suave}>Nenhum filme cadastrado.</Text>}
              {filmes.map(f => (
                <View key={f.id} style={estilos.item}>
                  <View style={estilos.itemInfo}>
                    <Text style={estilos.itemNome}>{f.titulo}</Text>
                    <Text style={estilos.itemMeta}>#{f.id} · {f.genero} · {f.ano} · {f.emCartaz ? 'EM CARTAZ' : 'OCULTO'}</Text>
                  </View>
                  {confirmandoFilme === f.id ? (
                    <View style={estilos.confirmacao}>
                      <Text style={estilos.perigo}>Retirar este filme do catálogo?</Text>
                      <Botao titulo="Sim, retirar" aoPressionar={() => excluirFilme(f.id)} carregando={salvando} />
                      <Botao titulo="Cancelar" tipo="contorno" aoPressionar={() => setConfirmandoFilme(null)} />
                    </View>
                  ) : (
                    <View style={estilos.itemAcoes}>
                      <Toque aoPressionar={() => editarFilme(f)} style={estilos.miniBotao}>
                        <Text style={estilos.miniBotaoTexto}>Editar</Text>
                      </Toque>
                      {f.emCartaz && <Toque aoPressionar={() => setConfirmandoFilme(f.id)} style={[estilos.miniBotao, estilos.miniPerigo]}>
                        <Text style={estilos.perigo}>Retirar</Text>
                      </Toque>}
                    </View>
                  )}
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            <View style={estilos.cartao}>
              <Text style={estilos.secao}>{editandoSessao ? 'Editar sessão #' + editandoSessao : 'Criar sessão e definir preço'}</Text>
              <Opcoes titulo="Filme" rolavel opcoes={filmes.filter(f => f.emCartaz).map(f => ({ valor: f.id, rotulo: f.titulo }))}
                escolhido={formSessao.filmeId} aoEscolher={v => mudarSessao('filmeId', v)} />
              <Opcoes titulo="Sala" rolavel opcoes={salas.map(s => ({ valor: s.id, rotulo: s.nome + ' (' + s.fileiras * s.colunas + ' lugares)' }))}
                escolhido={formSessao.salaId} aoEscolher={v => mudarSessao('salaId', v)} />
              <View style={[estilos.campos, { flexDirection: mobile ? 'column' : 'row' }]}>
                <Campo titulo="Data e hora (AAAA-MM-DDTHH:MM)" valor={formSessao.inicio} aoMudar={v => mudarSessao('inicio', v)}
                  placeholder="2026-12-01T19:00" largura={mobile ? '100%' : '55%'} />
                <Campo titulo="Preço por ingresso (R$)" valor={formSessao.preco} aoMudar={v => mudarSessao('preco', v)}
                  placeholder="32,00" largura={mobile ? '100%' : '42%'} />
              </View>
              <Opcoes titulo="Formato" opcoes={formatos.map(v => ({ valor: v, rotulo: v }))}
                escolhido={formSessao.formato} aoEscolher={v => mudarSessao('formato', v)} />
              <Text style={estilos.suave}>Cada sessão tem seu próprio preço. O valor é aplicado a novas compras. Sessões com pedidos já registrados não podem ser editadas nem excluídas.</Text>
              <View style={estilos.acoes}>
                <Botao titulo={editandoSessao ? 'Salvar sessão e preço' : 'Adicionar sessão no MySQL'}
                  aoPressionar={salvarSessao} carregando={salvando} />
                {editandoSessao && <Botao titulo="Cancelar edição" tipo="contorno" aoPressionar={() => novoFormularioSessao()} />}
              </View>
            </View>

            <View style={estilos.cartao}>
              <Text style={estilos.secao}>Sessões cadastradas</Text>
              <Opcoes titulo="Filtrar por filme" rolavel
                opcoes={filmes.map(f => ({ valor: f.id, rotulo: f.titulo }))}
                escolhido={filmeId}
                aoEscolher={v => { setFilmeId(v); setConfirmandoSessao(null); }} />
              {carregandoSessoes ? <ActivityIndicator color={cores.ouro} /> : (
                sessoes.length === 0 ? <Text style={estilos.suave}>Este filme não possui sessões.</Text> :
                sessoes.map(s => (
                  <View key={s.id} style={estilos.item}>
                    <View style={estilos.itemInfo}>
                      <Text style={estilos.itemNome}>{dataHora(s.inicio)} · {moeda(s.preco)}</Text>
                      <Text style={estilos.itemMeta}>#{s.id} · {s.sala} · {s.formato} · {s.reservas} pedido(s)</Text>
                    </View>
                    {confirmandoSessao === s.id ? (
                      <View style={estilos.confirmacao}>
                        <Text style={estilos.perigo}>Excluir esta sessão?</Text>
                        <Botao titulo="Confirmar exclusão" aoPressionar={() => excluirSessao(s.id)} carregando={salvando} />
                        <Botao titulo="Cancelar" tipo="contorno" aoPressionar={() => setConfirmandoSessao(null)} />
                      </View>
                    ) : (
                      <View style={estilos.itemAcoes}>
                        <Toque desabilitado={!!s.reservas} aoPressionar={() => editarSessao(s)}
                          style={[estilos.miniBotao, !!s.reservas && estilos.desabilitado]}>
                          <Text style={estilos.miniBotaoTexto}>Editar</Text>
                        </Toque>
                        <Toque desabilitado={!!s.reservas} aoPressionar={() => setConfirmandoSessao(s.id)}
                          style={[estilos.miniBotao, estilos.miniPerigo, !!s.reservas && estilos.desabilitado]}>
                          <Text style={estilos.perigo}>Excluir</Text>
                        </Toque>
                      </View>
                    )}
                  </View>
                ))
              )}
              {sessoes.length >= 300 && <Text style={estilos.suave}>Mostrando apenas as 300 sessões mais recentes. Use o filtro de filme.</Text>}
            </View>
          </>
        )}

        <Text style={estilos.rodape}>Todas as alterações são enviadas à API C# e registradas no banco MySQL do Railway. Os filmes retirados preservam pedidos e ingressos históricos.</Text>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  rolagem: { alignItems: 'center', paddingBottom: 90 },
  coluna: { width: '100%', maxWidth: 1170, paddingHorizontal: 20, paddingTop: 28, gap: 18 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 18 },
  topo: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 18, marginBottom: 8 },
  etiqueta: { color: cores.ouro, fontWeight: '800', fontSize: 10, letterSpacing: 2, marginBottom: 8 },
  titulo: { color: cores.texto, fontFamily: serifa, fontSize: 36, fontWeight: '700', marginBottom: 8 },
  suave: { color: cores.suave, fontSize: 13, lineHeight: 20 },
  abas: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  aba: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 10, backgroundColor: cores.superficie2, borderWidth: 1, borderColor: cores.borda },
  abaAtiva: { backgroundColor: cores.ouro, borderColor: cores.ouro },
  abaTexto: { color: cores.texto, fontWeight: '700', fontSize: 13 },
  abaTextoAtivo: { color: cores.ouroEscuro },
  recarregar: { padding: 12 },
  recarregarTexto: { color: cores.ouro, fontWeight: '700', fontSize: 13 },
  cartao: { borderRadius: 18, backgroundColor: cores.superficie, borderWidth: 1, borderColor: cores.borda, padding: 22, gap: 16 },
  secao: { color: cores.texto, fontFamily: serifa, fontWeight: '700', fontSize: 24 },
  campos: { justifyContent: 'space-between', gap: 12 },
  campo: { gap: 8, width: '100%' },
  rotulo: { color: cores.suave, fontSize: 11, fontWeight: '800', letterSpacing: 0.7 },
  entrada: { height: 46, backgroundColor: cores.superficie2, borderRadius: 10, borderWidth: 1, borderColor: cores.borda, paddingHorizontal: 12, color: cores.texto, fontSize: 14 },
  entradaGrande: { height: 104, paddingTop: 12, textAlignVertical: 'top' },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 2 },
  opcao: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 9, borderWidth: 1, borderColor: cores.borda, backgroundColor: cores.superficie2, maxWidth: 280 },
  opcaoAtiva: { backgroundColor: cores.ouro, borderColor: cores.ouro },
  opcaoTexto: { color: cores.texto, fontWeight: '600', fontSize: 12 },
  opcaoTextoAtivo: { color: cores.ouroEscuro },
  acoes: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 2 },
  item: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 14, borderTopWidth: 1, borderTopColor: cores.borda },
  itemInfo: { flex: 1, minWidth: 160, gap: 5 },
  itemNome: { color: cores.texto, fontWeight: '700', fontSize: 15 },
  itemMeta: { color: cores.suave, fontSize: 12 },
  itemAcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  miniBotao: { paddingVertical: 9, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: cores.ouro },
  miniBotaoTexto: { color: cores.ouro, fontSize: 12, fontWeight: '700' },
  miniPerigo: { borderColor: cores.erro },
  perigo: { color: cores.erro, fontSize: 12, fontWeight: '700' },
  confirmacao: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  desabilitado: { opacity: 0.35 },
  avisoErro: { padding: 13, backgroundColor: '#3a191c', borderRadius: 10, borderWidth: 1, borderColor: cores.erro },
  avisoErroTexto: { color: '#ff9792', fontSize: 13 },
  avisoSucesso: { padding: 13, backgroundColor: '#162b22', borderRadius: 10, borderWidth: 1, borderColor: cores.ok },
  avisoSucessoTexto: { color: cores.ok, fontSize: 13 },
  rodape: { color: cores.suave, textAlign: 'center', lineHeight: 19, fontSize: 12, paddingBottom: 20 },
});

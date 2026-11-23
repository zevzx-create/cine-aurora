import { API_URL } from './config';

let tokenAtual = null;

export const definirToken = (token) => {
  tokenAtual = token;
};

async function chamar(caminho, { metodo = 'GET', corpo } = {}) {
  const cabecalhos = { 'Content-Type': 'application/json' };
  if (tokenAtual) cabecalhos.Authorization = `Bearer ${tokenAtual}`;

  let resposta;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method: metodo,
      headers: cabecalhos,
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new Error('Sem conexão com o servidor.');
  }

  let dados = null;
  try {
    dados = await resposta.json();
  } catch {}

  if (!resposta.ok) {
    const mensagem = dados?.erro
      || (resposta.status === 401
        ? 'Sua sessão expirou. Saia e entre novamente.'
        : resposta.status === 404
          ? 'Rota não encontrada na API. Confira o último deploy do Railway.'
          : `Erro HTTP ${resposta.status}. Confira os logs no Railway.`);
    throw new Error(mensagem);
  }
  return dados;
}

export const listarFilmes = () => chamar('/api/filmes');
export const obterFilme = (id) => chamar(`/api/filmes/${id}`);
export const sessoesDoFilme = (id) => chamar(`/api/filmes/${id}/sessoes`);
export const obterSessao = (id) => chamar(`/api/sessoes/${id}`);
export const login = (corpo) => chamar('/api/auth/entrar', { metodo: 'POST', corpo });
export const cadastrar = (corpo) => chamar('/api/auth/registrar', { metodo: 'POST', corpo });
export const criarPedido = (corpo) => chamar('/api/pedidos', { metodo: 'POST', corpo });
export const meusPedidos = () => chamar('/api/pedidos/meus');
export const resumoAdmin = () => chamar('/api/admin/resumo');
export const excluirConta = (senha) => chamar('/api/auth/excluir-conta', { metodo: 'POST', corpo: { senha } });

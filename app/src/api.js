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
    throw new Error((dados && dados.erro) || 'Algo deu errado. Tente novamente.');
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
export const excluirConta = (senha) => chamar('/api/auth/conta', { metodo: 'DELETE', corpo: { senha } });

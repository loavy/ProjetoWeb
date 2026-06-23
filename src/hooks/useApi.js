// Importa hooks do React
import { useCallback, useEffect, useState } from "react";
// Importa função para obter o token JWT
import { getToken } from "./auth";

// Define a URL base da API (obtém de variável de ambiente ou vazio se não configurado)
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

/**
 * Resolve a URL completa do endpoint
 * @param {string} endpoint - Endpoint da API
 * @returns {string} URL completa resolvida
 */
function resolverUrl(endpoint) {
  // Se o endpoint já é uma URL absoluta, retorna como está
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }

  // Caso contrário, combina com a URL base
  return `${API_BASE_URL}${endpoint}`;
}

/**
 * Função para fazer requisições à API com autenticação automática
 * @param {string} endpoint - Endpoint da API
 * @param {Object} options - Opções do fetch (method, body, etc)
 * @returns {Promise<Object>} Resposta JSON da API
 * @throws {Error} Se a requisição falhar
 */
export async function apiFetch(endpoint, options = {}) {
  // Obtém o token JWT armazenado
  const token = getToken();
  // Cria um novo Headers object
  const headers = new Headers(options.headers || {});

  // Define Content-Type como JSON se houver body e não estiver definido
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  // Adiciona o token no header Authorization se disponível
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Faz a requisição fetch
  const response = await fetch(resolverUrl(endpoint), {
    ...options,
    headers,
  });

  // Tenta fazer parsing da resposta como JSON
  let data;
  try {
    data = await response.json();
  } catch {
    // Se falhar no parsing, data fica undefined
    data = undefined;
  }

  // Se a resposta não foi bem-sucedida, lança um erro
  if (!response.ok) {
    // Obtém a mensagem de erro da resposta ou usa uma mensagem padrão
    const mensagem =
      data?.mensagem ||
      data?.erro ||
      "Nao foi possivel concluir a operacao.";
    throw new Error(mensagem);
  }

  return data;
}

/**
 * Normaliza os dados retornados para sempre ser um array
 * @param {*} data - Dados a normalizar
 * @returns {Array} Array normalizado
 */
function normalizarLista(data) {
  // Se não houver dados, retorna array vazio
  if (!data) {
    return [];
  }

  // Se já é um array, retorna como está
  // Caso contrário, envolve em um array
  return Array.isArray(data) ? data : [data];
}

/**
 * Hook customizado para fazer requisições à API
 * @param {string} endpoint - Endpoint da API a chamar
 * @param {Object} options - Opções do hook
 * @param {boolean} options.immediate - Se deve carregar imediatamente (padrão: true)
 * @returns {Object} Objeto com data, loading, error, reload e setData
 */
function useApi(endpoint, options = {}) {
  // Extrai a opção immediate (faz a requisição automaticamente ao montar)
  const { immediate = true } = options;
  // Estado dos dados retornados
  const [data, setData] = useState([]);
  // Estado de carregamento
  const [loading, setLoading] = useState(immediate);
  // Estado de erro
  const [error, setError] = useState("");

  /**
   * Função para carregar os dados da API
   */
  const load = useCallback(
    async (url = endpoint) => {
      try {
        // Define loading como true
        setLoading(true);
        // Limpa qualquer erro anterior
        setError("");

        // Faz a requisição à API
        const json = await apiFetch(url);
        // Normaliza e armazena os dados
        setData(normalizarLista(json));
        return json;
      } catch (err) {
        // Se houver erro, armazena a mensagem
        setError(err.message);
        // Limpa os dados
        setData([]);
        return null;
      } finally {
        // Define loading como false
        setLoading(false);
      }
    },
    [endpoint],
  );

  /**
   * Efeito para carregar dados automaticamente ao montar o componente
   */
  useEffect(() => {
    if (immediate) {
      // Usa setTimeout para evitar chamadas síncronas problemáticas
      const timeout = setTimeout(() => {
        load(endpoint);
      }, 0);

      // Limpa o timeout ao desmontar
      return () => clearTimeout(timeout);
    }
  }, [endpoint, immediate, load]);

  // Retorna o objeto com dados e funções úteis
  return {
    data,
    loading,
    error,
    reload: load,
    setData,
  };
}

// Exporta o hook como padrão
export default useApi;

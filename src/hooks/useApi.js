import { useCallback, useEffect, useState } from "react";
import { getToken } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

function resolverUrl(endpoint) {
  // Resolve URL de chamada API: usa proxy do Vite se endpoint for relativo.
  // Se uma URL absoluta for informada, ela eh usada diretamente.
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }

  return `${API_BASE_URL}${endpoint}`;
}

export async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && options.body) {
    // Define JSON como Content-Type apenas quando ha body.
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    // Anexa token JWT ao cabecalho Authorization para rotas protegidas.
    // O backend espera Bearer token no cabecalho Authorization.
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(resolverUrl(endpoint), {
    ...options,
    headers,
  });

  let data;

  try {
    // Tenta parsear o corpo como JSON. Se nao for JSON, mantemos undefined.
    data = await response.json();
  } catch {
    data = undefined;
  }

  if (!response.ok) {
    // Converte resposta de erro em uma excecao legivel.
    // O backend retorna mensagem/erro para mostrar ao usuario.
    const mensagem =
      data?.mensagem ||
      data?.erro ||
      "Nao foi possivel concluir a operacao.";
    throw new Error(mensagem);
  }

  return data;
}

function normalizarLista(data) {
  // Garante que os dados retornados do API sejam sempre um array.
  // Isso simplifica o consumo das respostas no frontend e evita checagens extras.
  if (!data) {
    return [];
  }

  return Array.isArray(data) ? data : [data];
}

function useApi(endpoint, options = {}) {
  const { immediate = true } = options;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState("");

  const load = useCallback(
    async (url = endpoint) => {
      try {
        setLoading(true);
        setError("");

        // Chama o helper de fetch e normaliza o retorno para um array.
        const json = await apiFetch(url);
        setData(normalizarLista(json));
        return json;
      } catch (err) {
        // Registra o erro para a interface mostrar feedback.
        setError(err.message);
        setData([]);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [endpoint],
  );

  useEffect(() => {
    if (immediate) {
      const timeout = setTimeout(() => {
        load(endpoint);
      }, 0);

      return () => clearTimeout(timeout);
    }
  }, [endpoint, immediate, load]);

  return {
    data,
    loading,
    error,
    reload: load,
    setData,
  };
}

export default useApi;

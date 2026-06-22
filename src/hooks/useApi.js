import { useCallback, useEffect, useState } from "react";
import { getToken } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

function resolverUrl(endpoint) {
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }

  return `${API_BASE_URL}${endpoint}`;
}

export async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(resolverUrl(endpoint), {
    ...options,
    headers,
  });

  let data;

  try {
    data = await response.json();
  } catch {
    data = undefined;
  }

  if (!response.ok) {
    const mensagem =
      data?.mensagem ||
      data?.erro ||
      "Nao foi possivel concluir a operacao.";
    throw new Error(mensagem);
  }

  return data;
}

function normalizarLista(data) {
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

        const json = await apiFetch(url);
        setData(normalizarLista(json));
        return json;
      } catch (err) {
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

import { Edit3, Loader2, Plus, RefreshCw, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import { apiFetch } from "../../hooks/useApi";
import useApi from "../../hooks/useApi";
import styles from "./Products.module.css";

const produtoVazio = {
  id: "",
  nome: "",
  preco: "",
  quantidade_estoque: "",
  empresa_id: "",
};

function formatCurrency(value) {
  const number = Number(value || 0);

  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function Products() {
  const { data: products, loading, error, reload } = useApi("/api/products");
  const {
    data: companies,
    loading: carregandoCompanies,
    error: erroCompanies,
    reload: reloadCompanies,
  } = useApi("/api/companies");
  const [form, setForm] = useState(produtoVazio);
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState("");

  const editando = Boolean(form.id);

  function atualizarCampo(nome, valor) {
    setForm((atual) => ({ ...atual, [nome]: valor }));
  }

  function limparForm() {
    setForm(produtoVazio);
  }

  function editarProduto(product) {
    setForm({
      id: String(product.id),
      nome: product.nome || "",
      preco: String(product.preco ?? ""),
      quantidade_estoque: String(product.quantidade_estoque ?? ""),
      empresa_id: String(product.empresa_id || ""),
    });
    setFeedback("");
  }

  async function recarregarTudo() {
    await Promise.all([reload(), reloadCompanies()]);
  }

  async function salvarProduto(event) {
    event.preventDefault();
    setSalvando(true);
    setFeedback("");

    try {
      const endpoint = editando ? `/api/products/${form.id}` : "/api/products";
      await apiFetch(endpoint, {
        method: editando ? "PUT" : "POST",
        body: JSON.stringify({
          nome: form.nome,
          preco: form.preco,
          quantidade_estoque: form.quantidade_estoque,
          empresa_id: form.empresa_id,
        }),
      });
      limparForm();
      await reload();
      setFeedback(editando ? "Produto atualizado." : "Produto cadastrado.");
    } catch (err) {
      setFeedback(err.message);
    } finally {
      setSalvando(false);
    }
  }

  async function deletarProduto(product) {
    const confirmou = window.confirm(`Remover o produto ${product.nome}?`);

    if (!confirmou) {
      return;
    }

    setFeedback("");

    try {
      await apiFetch(`/api/products/${product.id}`, { method: "DELETE" });
      await reload();
      setFeedback("Produto removido.");
      if (String(product.id) === form.id) {
        limparForm();
      }
    } catch (err) {
      setFeedback(err.message);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.headerBand}>
        <div>
          <span>Modulo de produtos</span>
          <h1>Produtos vinculados a empresas</h1>
          <p>
            Cadastre produtos escolhendo uma empresa no dropdown. A listagem
            mostra o fornecedor via relacionamento com a tabela companies.
          </p>
        </div>

        <button type="button" onClick={recarregarTudo}>
          <RefreshCw size={18} />
          <span>Atualizar</span>
        </button>
      </section>

      <section className={styles.workspace}>
        <form className={styles.formPanel} onSubmit={salvarProduto}>
          <div className={styles.panelHeader}>
            <span>{editando ? "Edicao" : "Cadastro"}</span>
            <h2>{editando ? `Produto ${form.id}` : "Novo produto"}</h2>
          </div>

          <label className={styles.field}>
            <span>Nome</span>
            <input
              value={form.nome}
              onChange={(event) => atualizarCampo("nome", event.target.value)}
              placeholder="Nome do produto"
              required
            />
          </label>

          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span>Preco</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.preco}
                onChange={(event) => atualizarCampo("preco", event.target.value)}
                placeholder="0.00"
                required
              />
            </label>

            <label className={styles.field}>
              <span>Estoque</span>
              <input
                type="number"
                min="0"
                step="1"
                value={form.quantidade_estoque}
                onChange={(event) =>
                  atualizarCampo("quantidade_estoque", event.target.value)
                }
                placeholder="0"
                required
              />
            </label>
          </div>

          <label className={styles.field}>
            <span>Empresa</span>
            <select
              value={form.empresa_id}
              onChange={(event) => atualizarCampo("empresa_id", event.target.value)}
              required
            >
              <option value="">Selecione uma empresa</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.nome}
                </option>
              ))}
            </select>
          </label>

          {erroCompanies && <p className={`${styles.status} ${styles.error}`}>{erroCompanies}</p>}
          {!erroCompanies && !carregandoCompanies && companies.length === 0 && (
            <p className={styles.status}>
              Cadastre uma empresa antes de criar produtos.
            </p>
          )}

          <div className={styles.formActions}>
            <button type="submit" disabled={salvando || companies.length === 0}>
              {salvando ? <Loader2 className={styles.spinner} size={18} /> : <Save size={18} />}
              <span>{salvando ? "Salvando..." : "Salvar"}</span>
            </button>

            {editando && (
              <button type="button" className={styles.secondaryButton} onClick={limparForm}>
                <X size={18} />
                <span>Cancelar</span>
              </button>
            )}
          </div>

          {feedback && <p className={styles.feedback}>{feedback}</p>}
        </form>

        <section className={styles.tablePanel}>
          <div className={styles.tableHeader}>
            <div>
              <span>Listagem</span>
              <h2>{products.length} produto(s)</h2>
            </div>

            <button type="button" onClick={limparForm}>
              <Plus size={18} />
              <span>Novo</span>
            </button>
          </div>

          {loading && <p className={styles.status}>Carregando produtos...</p>}
          {error && <p className={`${styles.status} ${styles.error}`}>{error}</p>}

          {!loading && !error && (
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Produto</th>
                    <th>Preco</th>
                    <th>Estoque</th>
                    <th>Fornecedor</th>
                    <th>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>{product.nome}</td>
                      <td>{formatCurrency(product.preco)}</td>
                      <td>{product.quantidade_estoque}</td>
                      <td>{product.empresa_nome || "-"}</td>
                      <td>
                        <div className={styles.rowActions}>
                          <button
                            type="button"
                            title="Editar"
                            onClick={() => editarProduto(product)}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            type="button"
                            className={styles.dangerButton}
                            title="Excluir"
                            onClick={() => deletarProduto(product)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {products.length === 0 && (
                    <tr>
                      <td colSpan="6">Nenhum produto cadastrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

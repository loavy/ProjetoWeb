// Importa ícones do Lucide React
import { Edit3, Loader2, Plus, RefreshCw, Save, Trash2, X } from "lucide-react";
// Importa hook useState do React
import { useState } from "react";
// Importa função para verificar permissão de admin
import { isAdmin } from "../../hooks/auth";
// Importa hook customizado e função para requisições à API
import useApi, { apiFetch } from "../../hooks/useApi";
// Importa estilos CSS do componente
import styles from "./Companies.module.css";

// Objeto padrão para um formulário vazio de empresa
const empresaVazia = {
  id: "",
  nome: "",
  cnpj: "",
  telefone: "",
};

/**
 * Componente de Gerenciamento de Empresas
 * Permite listar, criar, editar e deletar empresas (se admin)
 */
export default function Companies() {
  // Carrega lista de empresas da API
  const { data: companies, loading, error, reload } = useApi("/api/companies");
  // Verifica se o usuário tem permissão de admin
  const admin = isAdmin();
  // Define classe CSS dependendo de permissão (mostra ou não o formulário)
  const workspaceClass = admin
    ? styles.workspace
    : `${styles.workspace} ${styles.noForm}`;
  
  // Estado do formulário de empresa
  const [form, setForm] = useState(empresaVazia);
  // Estado para controlar se está salvando
  const [salvando, setSalvando] = useState(false);
  // Estado para feedback (mensagens) ao usuário
  const [feedback, setFeedback] = useState("");
  // Estado para filtro de busca por nome
  const [searchName, setSearchName] = useState("");

  // Verifica se está editando (se há um ID no formulário)
  const editando = Boolean(form.id);

  // Filtra empresas visíveis baseado na busca por nome
  const visibleCompanies = (companies || []).filter((c) =>
    (c.nome || "").toLowerCase().includes(searchName.toLowerCase()),
  );

  /**
   * Atualiza um campo do formulário
   * @param {string} nome - Nome do campo
   * @param {*} valor - Novo valor do campo
   */
  function atualizarCampo(nome, valor) {
    setForm((atual) => ({ ...atual, [nome]: valor }));
  }

  /**
   * Limpa o formulário para criar uma nova empresa
   */
  function limparForm() {
    setForm(empresaVazia);
  }

  /**
   * Carrega uma empresa no formulário para edição
   * @param {Object} company - Empresa a editar
   */
  function editarEmpresa(company) {
    setForm({
      id: String(company.id),
      nome: company.nome || "",
      cnpj: company.cnpj || "",
      telefone: company.telefone || "",
    });
    setFeedback("");
  }

  /**
   * Salva uma empresa (cria nova ou atualiza existente)
   * @param {Event} event - Evento do formulário
   */
  async function salvarEmpresa(event) {
    event.preventDefault();
    setSalvando(true);
    setFeedback("");

    try {
      // Define endpoint baseado se está editando ou criando
      const endpoint = editando
        ? `/api/companies/${form.id}`
        : "/api/companies";
      // Faz a requisição à API
      await apiFetch(endpoint, {
        method: editando ? "PUT" : "POST",
        body: JSON.stringify({
          nome: form.nome,
          cnpj: form.cnpj,
          telefone: form.telefone,
        }),
      });
      // Limpa o formulário
      limparForm();
      // Recarrega a lista de empresas
      await reload();
      // Exibe mensagem de sucesso
      setFeedback(editando ? "Empresa atualizada." : "Empresa cadastrada.");
    } catch (err) {
      // Exibe mensagem de erro
      setFeedback(err.message);
    } finally {     setSalvando(false);
    }
  }

  /**
   * Deleta uma empresa após confirmação
   * @param {Object} company - Empresa a deletar
   */
  async function deletarEmpresa(company) {
    // Pede confirmação ao usuário
    const confirmou = window.confirm(`Remover a empresa ${company.nome}?`);

    if (!confirmou) {
      return;
    }

    setFeedback("");

    try {
      // Faz a requisição de delete à API
      await apiFetch(`/api/companies/${company.id}`, { method: "DELETE" });
      // Recarrega a lista
      await reload();
      // Exibe mensagem de sucesso
      setFeedback("Empresa removida.");
      // Limpa o formulário se estava editando a empresa deletada
      if (String(company.id) === form.id) {
        limparForm();
      }
    } catch (err) {
      // Exibe mensagem de erro
      setFeedback(err.message);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.headerBand}>
        <div>
          <span>Modulo de empresas</span>
          <h1>Empresas fornecedoras</h1>
          <p>
            Cadastre os fornecedores antes de criar produtos. O CNPJ deve ser
            unico no banco.
          </p>
        </div>

        <button type="button" onClick={() => reload()}>
          <RefreshCw size={18} />
          <span>Atualizar</span>
        </button>
      </section>

      <section className={workspaceClass}>
        {admin && (
          <form className={styles.formPanel} onSubmit={salvarEmpresa}>
            <div className={styles.panelHeader}>
              <span>{editando ? "Edicao" : "Cadastro"}</span>
              <h2>{editando ? `Empresa ${form.id}` : "Nova empresa"}</h2>
            </div>

            <label className={styles.field}>
              <span>Nome</span>
              <input
                value={form.nome}
                onChange={(event) => atualizarCampo("nome", event.target.value)}
                placeholder="Nome da empresa"
                required
              />
            </label>

            <label className={styles.field}>
              <span>CNPJ</span>
              <input
                value={form.cnpj}
                onChange={(event) => atualizarCampo("cnpj", event.target.value)}
                placeholder="00.000.000/0000-00"
                required
              />
            </label>

            <label className={styles.field}>
              <span>Telefone</span>
              <input
                value={form.telefone}
                onChange={(event) =>
                  atualizarCampo("telefone", event.target.value)
                }
                placeholder="(00) 00000-0000"
              />
            </label>

            <div className={styles.formActions}>
              <button type="submit" disabled={salvando}>
                {salvando ? (
                  <Loader2 className={styles.spinner} size={18} />
                ) : (
                  <Save size={18} />
                )}
                <span>{salvando ? "Salvando..." : "Salvar"}</span>
              </button>

              <button
                type="button"
                className={styles.orangeButton}
                onClick={limparForm}
              >
                <Plus size={18} />
                <span>Limpar Formulario</span>
              </button>

              {editando && (
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={limparForm}
                >
                  <X size={18} />
                  <span>Cancelar</span>
                </button>
              )}
            </div>

            {feedback && <p className={styles.feedback}>{feedback}</p>}
          </form>
        )}

        <section className={styles.tablePanel}>
          <div className={styles.tableHeader}>
            <div>
              <span>Listagem</span>
              <h2>{visibleCompanies.length} empresa(s)</h2>

              <div className={styles.filters}>
                <input
                  placeholder="Buscar por nome"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
            </div>
          </div>

          {loading && <p className={styles.status}>Carregando empresas...</p>}
          {error && (
            <p className={`${styles.status} ${styles.error}`}>{error}</p>
          )}

          {!loading && !error && (
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>CNPJ</th>
                    <th>Telefone</th>
                    {admin && <th>Acoes</th>}
                  </tr>
                </thead>
                <tbody>
                  {visibleCompanies.map((company) => (
                    <tr key={company.id}>
                      <td>{company.id}</td>
                      <td>{company.nome}</td>
                      <td>{company.cnpj}</td>
                      <td>{company.telefone || "-"}</td>
                      {admin && (
                        <td>
                          <div className={styles.rowActions}>
                            <button
                              type="button"
                              title="Editar"
                              onClick={() => editarEmpresa(company)}
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              type="button"
                              className={styles.dangerButton}
                              title="Excluir"
                              onClick={() => deletarEmpresa(company)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}

                  {visibleCompanies.length === 0 && (
                    <tr>
                      <td colSpan={admin ? "5" : "4"}>
                        Nenhuma empresa cadastrada.
                      </td>
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

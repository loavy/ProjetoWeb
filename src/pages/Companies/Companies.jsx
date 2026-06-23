import { Edit3, Loader2, Plus, RefreshCw, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import { isAdmin } from "../../hooks/auth";
import useApi, { apiFetch } from "../../hooks/useApi";
import styles from "./Companies.module.css";

const empresaVazia = {
  id: "",
  nome: "",
  cnpj: "",
  telefone: "",
};

// Pagina de gerencia de empresas. Permite listar, criar, editar e remover empresas.
export default function Companies() {
  const { data: companies, loading, error, reload } = useApi("/api/companies");
  const admin = isAdmin();
  const workspaceClass = admin
    ? styles.workspace
    : `${styles.workspace} ${styles.noForm}`;
  const [form, setForm] = useState(empresaVazia);
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [searchName, setSearchName] = useState("");

  const editando = Boolean(form.id);

  // Filtra empresas localmente por nome conforme o usuario digita.
  const visibleCompanies = (companies || []).filter((c) =>
    (c.nome || "").toLowerCase().includes(searchName.toLowerCase()),
  );

  function atualizarCampo(nome, valor) {
    setForm((atual) => ({ ...atual, [nome]: valor }));
  }

  function limparForm() {
    setForm(empresaVazia);
  }

  function editarEmpresa(company) {
    setForm({
      id: String(company.id),
      nome: company.nome || "",
      cnpj: company.cnpj || "",
      telefone: company.telefone || "",
    });
    setFeedback("");
  }

  async function salvarEmpresa(event) {
    event.preventDefault();
    setSalvando(true);
    setFeedback("");

    try {
      // Decide se sera criacao ou atualizacao com base em form.id.
      const endpoint = editando
        ? `/api/companies/${form.id}`
        : "/api/companies";
      await apiFetch(endpoint, {
        method: editando ? "PUT" : "POST",
        body: JSON.stringify({
          nome: form.nome,
          cnpj: form.cnpj,
          telefone: form.telefone,
        }),
      });
      limparForm();
      await reload();
      setFeedback(editando ? "Empresa atualizada." : "Empresa cadastrada.");
    } catch (err) {
      setFeedback(err.message);
    } finally {
      setSalvando(false);
    }
  }

  async function deletarEmpresa(company) {
    // Confirma exclusao com o usuario antes de chamar a API.
    const confirmou = window.confirm(`Remover a empresa ${company.nome}?`);

    if (!confirmou) {
      return;
    }

    setFeedback("");

    try {
      await apiFetch(`/api/companies/${company.id}`, { method: "DELETE" });
      await reload();
      setFeedback("Empresa removida.");
      if (String(company.id) === form.id) {
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

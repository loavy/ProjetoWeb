import {
  CheckSquare,
  Download,
  Edit3,
  Eye,
  FileDown,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import useApi from "../../hooks/useApi";
import styles from "./Questoes.module.css";
import {
  alternarItemSelecionado,
  deletarQuestaoAdmin,
  formatarVestibular,
  gerarPdfQuestao,
  gerarPdfQuestoesSelecionadas,
  getAnosDisponiveis,
  getEnunciadoLimpo,
  getFormularioQuestaoVazio,
  getIdsDisponiveis,
  getQuestoesSelecionadasVisiveis,
  getRespostaCorreta,
  getVestibularesDisponiveis,
  montarFormularioQuestao,
  montarUrlQuestoes,
  salvarQuestaoAdmin,
  selecionarTodasQuestoes,
} from "./QuestoesFuncoes";

const filtrosIniciais = {
  busca: "",
  questaoId: "",
  vestibularId: "",
  nivel: "",
  ano: "",
};

export default function Questoes() {
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [questaoAtivaId, setQuestaoAtivaId] = useState(null);
  const [questoesSelecionadas, setQuestoesSelecionadas] = useState([]);
  const [modoFormulario, setModoFormulario] = useState("");
  const [formularioQuestao, setFormularioQuestao] = useState(
    getFormularioQuestaoVazio,
  );
  const [salvandoQuestao, setSalvandoQuestao] = useState(false);
  const [feedback, setFeedback] = useState("");

  const { data: questoes, loading, error, reload } = useApi("/api/questoes");
  const { data: anos, reload: reloadAnos } = useApi("/api/questoes/anos");
  const { data: ids, reload: reloadIds } = useApi("/api/questoes/ids");
  const { data: vestibulares, reload: reloadVestibulares } = useApi(
    "/api/questoes/vestibulares",
  );

  const anosDisponiveis = getAnosDisponiveis(anos);
  const idsDisponiveis = getIdsDisponiveis(ids);
  const vestibularesDisponiveis = getVestibularesDisponiveis(vestibulares);
  const questoesSelecionadasVisiveis = getQuestoesSelecionadasVisiveis(
    questoes,
    questoesSelecionadas,
  );
  const todasQuestoesSelecionadas =
    questoes.length > 0 &&
    questoesSelecionadasVisiveis.length === questoes.length;
  const temFiltroAtivo = Object.values(filtros).some(Boolean);

  const questaoAtiva = useMemo(
    () =>
      questoes.find((questao) => questao.id === questaoAtivaId) ||
      questoes[0] ||
      null,
    [questaoAtivaId, questoes],
  );
  const respostaCorreta = questaoAtiva ? getRespostaCorreta(questaoAtiva) : null;

  function atualizarFiltro(nome, valor) {
    setFiltros((atuais) => ({ ...atuais, [nome]: valor }));
  }

  function limparResultadoAtual() {
    setQuestaoAtivaId(null);
    setQuestoesSelecionadas([]);
  }

  function pesquisarQuestoes(event) {
    event.preventDefault();
    setFeedback("");
    limparResultadoAtual();
    reload(montarUrlQuestoes(filtros));
  }

  function limparBusca() {
    setFiltros(filtrosIniciais);
    setFeedback("");
    limparResultadoAtual();
    reload("/api/questoes");
  }

  function alternarSelecaoQuestao(id) {
    setQuestoesSelecionadas((atuais) => alternarItemSelecionado(atuais, id));
  }

  function alternarTodasQuestoes() {
    setQuestoesSelecionadas(
      selecionarTodasQuestoes(questoes, todasQuestoesSelecionadas),
    );
  }

  function atualizarCampoQuestao(nome, valor) {
    setFormularioQuestao((atual) => ({ ...atual, [nome]: valor }));
  }

  function abrirFormularioAdicionar() {
    setFeedback("");
    setModoFormulario("adicionar");
    setFormularioQuestao(getFormularioQuestaoVazio());
  }

  function abrirFormularioAtualizar(questao) {
    setFeedback("");
    setModoFormulario("atualizar");
    setFormularioQuestao(montarFormularioQuestao(questao));
  }

  function fecharFormularioQuestao() {
    setModoFormulario("");
    setFormularioQuestao(getFormularioQuestaoVazio());
  }

  async function recarregarDadosQuestoes() {
    await Promise.all([
      reload(montarUrlQuestoes(filtros)),
      reloadAnos(),
      reloadIds(),
      reloadVestibulares(),
    ]);
  }

  async function salvarFormularioQuestao(event) {
    event.preventDefault();
    setSalvandoQuestao(true);
    setFeedback("");

    try {
      await salvarQuestaoAdmin(modoFormulario, formularioQuestao);
      await recarregarDadosQuestoes();
      fecharFormularioQuestao();
      setFeedback("Questao salva com sucesso.");
    } catch (erro) {
      setFeedback(erro.message);
    } finally {
      setSalvandoQuestao(false);
    }
  }

  async function deletarQuestao(questao) {
    const confirmou = window.confirm(`Deseja deletar a questao ${questao.id}?`);

    if (!confirmou) {
      return;
    }

    setSalvandoQuestao(true);
    setFeedback("");

    try {
      await deletarQuestaoAdmin(questao.id);
      setQuestaoAtivaId((atual) => (atual === questao.id ? null : atual));
      setQuestoesSelecionadas((atuais) =>
        atuais.filter((id) => id !== questao.id),
      );
      await recarregarDadosQuestoes();
      setFeedback("Questao removida com sucesso.");
    } catch (erro) {
      setFeedback(erro.message);
    } finally {
      setSalvandoQuestao(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.headerBand}>
        <div>
          <span className={styles.eyebrow}>Biblioteca</span>
          <h1>Questoes de matematica</h1>
          <p>
            Filtre o banco de questoes por enunciado, ID, vestibular, nivel ou
            ano. Abra uma questao para revisar alternativas, resposta e
            explicacao.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button type="button" onClick={() => recarregarDadosQuestoes()}>
            <RefreshCw size={18} />
            <span>Recarregar</span>
          </button>

          <button type="button" onClick={abrirFormularioAdicionar}>
            <Plus size={18} />
            <span>Nova questao</span>
          </button>
        </div>
      </section>

      <form className={styles.filters} onSubmit={pesquisarQuestoes}>
        <label className={styles.searchField}>
          <span>Busca</span>
          <div>
            <Search size={18} />
            <input
              type="text"
              placeholder="Pesquisar no enunciado"
              value={filtros.busca}
              onChange={(event) => atualizarFiltro("busca", event.target.value)}
            />
          </div>
        </label>

        <label className={styles.field}>
          <span>ID</span>
          <select
            value={filtros.questaoId}
            onChange={(event) => atualizarFiltro("questaoId", event.target.value)}
          >
            <option value="">Todos</option>
            {idsDisponiveis.map((idDisponivel) => (
              <option key={idDisponivel} value={idDisponivel}>
                {idDisponivel}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span>Vestibular</span>
          <select
            value={filtros.vestibularId}
            onChange={(event) =>
              atualizarFiltro("vestibularId", event.target.value)
            }
          >
            <option value="">Todos</option>
            {vestibularesDisponiveis.map((vestibular) => (
              <option key={vestibular.id} value={vestibular.id}>
                {formatarVestibular(vestibular)}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span>Nivel</span>
          <select
            value={filtros.nivel}
            onChange={(event) => atualizarFiltro("nivel", event.target.value)}
          >
            <option value="">Todos</option>
            <option value="base">Base</option>
            <option value="intermediario">Intermediario</option>
            <option value="avancado">Avancado</option>
          </select>
        </label>

        <label className={styles.field}>
          <span>Ano</span>
          <select
            value={filtros.ano}
            onChange={(event) => atualizarFiltro("ano", event.target.value)}
          >
            <option value="">Todos</option>
            {anosDisponiveis.map((anoDisponivel) => (
              <option key={anoDisponivel} value={anoDisponivel}>
                {anoDisponivel}
              </option>
            ))}
          </select>
        </label>

        <div className={styles.filterActions}>
          <button type="submit">
            <Filter size={18} />
            <span>Filtrar</span>
          </button>

          {temFiltroAtivo && (
            <button type="button" className={styles.secondaryButton} onClick={limparBusca}>
              <RotateCcw size={18} />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </form>

      <section className={styles.selectionBar}>
        <label>
          <input
            type="checkbox"
            checked={todasQuestoesSelecionadas}
            onChange={alternarTodasQuestoes}
          />
          <span>Selecionar resultados</span>
        </label>

        <strong>{questoesSelecionadasVisiveis.length} selecionada(s)</strong>

        <button
          type="button"
          disabled={questoesSelecionadasVisiveis.length === 0}
          onClick={() => gerarPdfQuestoesSelecionadas(questoesSelecionadasVisiveis)}
        >
          <Download size={18} />
          <span>PDF selecionadas</span>
        </button>

        {questoesSelecionadasVisiveis.length > 0 && (
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => setQuestoesSelecionadas([])}
          >
            <X size={18} />
            <span>Desmarcar</span>
          </button>
        )}
      </section>

      {feedback && <p className={styles.feedback}>{feedback}</p>}

      {loading && (
        <div className={styles.status}>
          <Loader2 className={styles.spinner} size={20} />
          <span>Carregando questoes...</span>
        </div>
      )}

      {error && !loading && (
        <div className={`${styles.status} ${styles.error}`}>
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && questoes.length === 0 && (
        <div className={styles.status}>
          <span>Nenhuma questao encontrada para os filtros atuais.</span>
        </div>
      )}

      {!loading && !error && questoes.length > 0 && (
        <section className={styles.workspace}>
          <div className={styles.resultsPanel}>
            <div className={styles.resultsHeader}>
              <div>
                <span>Resultados</span>
                <h2>{questoes.length} questao(oes)</h2>
              </div>
            </div>

            <div className={styles.list}>
              {questoes.map((questao) => {
                const ativa = questaoAtiva?.id === questao.id;
                const selecionada = questoesSelecionadas.includes(questao.id);

                return (
                  <article
                    className={`${styles.questionCard} ${
                      ativa ? styles.activeCard : ""
                    }`}
                    key={questao.id}
                  >
                    <div className={styles.cardTop}>
                      <label className={styles.cardCheckbox}>
                        <input
                          type="checkbox"
                          checked={selecionada}
                          onChange={() => alternarSelecaoQuestao(questao.id)}
                          aria-label={`Selecionar questao ${questao.id}`}
                        />
                        <CheckSquare size={16} />
                      </label>

                      <span>ID {questao.id}</span>
                      {questao.nivel && <small>{questao.nivel}</small>}
                    </div>

                    <button
                      type="button"
                      className={styles.questionPreview}
                      onClick={() => setQuestaoAtivaId(questao.id)}
                    >
                      <strong>{questao.vestibular || "Vestibular nao informado"}</strong>
                      <span>
                        {getEnunciadoLimpo(questao) || "Enunciado nao informado."}
                      </span>
                    </button>

                    <div className={styles.cardActions}>
                      <button type="button" onClick={() => setQuestaoAtivaId(questao.id)}>
                        <Eye size={16} />
                        <span>Abrir</span>
                      </button>

                      <button type="button" onClick={() => gerarPdfQuestao(questao)}>
                        <FileDown size={16} />
                        <span>PDF</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className={styles.detailPanel}>
            {questaoAtiva ? (
              <>
                <div className={styles.detailHeader}>
                  <div>
                    <span>Questao ativa</span>
                    <h2>ID {questaoAtiva.id}</h2>
                  </div>

                  <div className={styles.detailActions}>
                    <button
                      type="button"
                      title="Baixar PDF"
                      onClick={() => gerarPdfQuestao(questaoAtiva)}
                    >
                      <FileDown size={18} />
                    </button>
                    <button
                      type="button"
                      title="Editar questao"
                      onClick={() => abrirFormularioAtualizar(questaoAtiva)}
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      type="button"
                      title="Deletar questao"
                      className={styles.dangerIconButton}
                      onClick={() => deletarQuestao(questaoAtiva)}
                      disabled={salvandoQuestao}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <dl className={styles.metaGrid}>
                  <div>
                    <dt>Vestibular</dt>
                    <dd>{questaoAtiva.vestibular || "Nao informado"}</dd>
                  </div>
                  <div>
                    <dt>Ano</dt>
                    <dd>{questaoAtiva.ano || "-"}</dd>
                  </div>
                  <div>
                    <dt>Nivel</dt>
                    <dd>{questaoAtiva.nivel || "-"}</dd>
                  </div>
                  <div>
                    <dt>Topico</dt>
                    <dd>{questaoAtiva.topico || "-"}</dd>
                  </div>
                </dl>

                <div className={styles.detailBlock}>
                  <span>Enunciado</span>
                  <p>{getEnunciadoLimpo(questaoAtiva) || "Enunciado nao informado."}</p>
                </div>

                {questaoAtiva.alternativas?.length > 0 && (
                  <div className={styles.alternatives}>
                    <span>Alternativas</span>
                    {questaoAtiva.alternativas.map((alternativa) => (
                      <p key={`${questaoAtiva.id}-${alternativa.letra}`}>
                        <strong>{alternativa.letra})</strong> {alternativa.texto}
                      </p>
                    ))}
                  </div>
                )}

                <div className={styles.answerBox}>
                  <div>
                    <span>Resposta</span>
                    <p>
                      {respostaCorreta
                        ? `${respostaCorreta.letra}) ${respostaCorreta.texto}`
                        : "Resposta nao cadastrada."}
                    </p>
                  </div>

                  <div>
                    <span>Explicacao</span>
                    <p>{questaoAtiva.explicacao || "Explicacao nao cadastrada."}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.emptyDetail}>
                <Eye size={28} />
                <h2>Selecione uma questao</h2>
                <p>O detalhe aparece aqui para leitura e revisao.</p>
              </div>
            )}
          </aside>
        </section>
      )}

      {modoFormulario && (
        <div className={styles.modalBackdrop} role="presentation">
          <form className={styles.modal} onSubmit={salvarFormularioQuestao}>
            <div className={styles.modalHeader}>
              <div>
                <span>Edicao</span>
                <h2>
                  {modoFormulario === "adicionar"
                    ? "Nova questao"
                    : `Atualizar questao ${formularioQuestao.id}`}
                </h2>
              </div>

              <button
                type="button"
                className={styles.iconButton}
                onClick={fecharFormularioQuestao}
                title="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            {modoFormulario === "atualizar" && (
              <label className={styles.formField}>
                <span>ID</span>
                <input type="number" value={formularioQuestao.id} disabled />
              </label>
            )}

            <label className={styles.formField}>
              <span>Enunciado</span>
              <textarea
                value={formularioQuestao.enunciado}
                onChange={(event) =>
                  atualizarCampoQuestao("enunciado", event.target.value)
                }
                required={modoFormulario === "adicionar"}
              />
            </label>

            <label className={styles.formField}>
              <span>Explicacao</span>
              <textarea
                value={formularioQuestao.explicacao}
                onChange={(event) =>
                  atualizarCampoQuestao("explicacao", event.target.value)
                }
              />
            </label>

            <div className={styles.formGrid}>
              <label className={styles.formField}>
                <span>Subtopico ID</span>
                <input
                  type="number"
                  min="1"
                  value={formularioQuestao.subtopico_id}
                  onChange={(event) =>
                    atualizarCampoQuestao("subtopico_id", event.target.value)
                  }
                  required={modoFormulario === "adicionar"}
                />
              </label>

              <label className={styles.formField}>
                <span>Vestibular</span>
                <select
                  value={formularioQuestao.vestibular_id}
                  onChange={(event) =>
                    atualizarCampoQuestao("vestibular_id", event.target.value)
                  }
                >
                  <option value="">Nao informado</option>
                  {vestibularesDisponiveis.map((vestibular) => (
                    <option key={vestibular.id} value={vestibular.id}>
                      {formatarVestibular(vestibular)}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.formField}>
                <span>Ano</span>
                <select
                  value={formularioQuestao.ano}
                  onChange={(event) => atualizarCampoQuestao("ano", event.target.value)}
                >
                  <option value="">Nao informado</option>
                  {anosDisponiveis.map((anoDisponivel) => (
                    <option key={anoDisponivel} value={anoDisponivel}>
                      {anoDisponivel}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.formField}>
                <span>Avaliacao ID</span>
                <input
                  type="number"
                  min="1"
                  value={formularioQuestao.avaliacao_id}
                  onChange={(event) =>
                    atualizarCampoQuestao("avaliacao_id", event.target.value)
                  }
                />
              </label>

              <label className={styles.formField}>
                <span>Tipo</span>
                <select
                  value={formularioQuestao.tipo}
                  onChange={(event) => atualizarCampoQuestao("tipo", event.target.value)}
                >
                  <option value="base">Base</option>
                  <option value="vestibular">Vestibular</option>
                </select>
              </label>
            </div>

            <label className={styles.formField}>
              <span>Conteudo</span>
              <input
                type="text"
                value={formularioQuestao.conteudo}
                onChange={(event) =>
                  atualizarCampoQuestao("conteudo", event.target.value)
                }
                placeholder="Opcional"
              />
            </label>

            <label className={styles.formField}>
              <span>Comentario do especialista</span>
              <textarea
                value={formularioQuestao.comentario_especialista}
                onChange={(event) =>
                  atualizarCampoQuestao(
                    "comentario_especialista",
                    event.target.value,
                  )
                }
              />
            </label>

            <label className={styles.formField}>
              <span>Link de apoio</span>
              <input
                type="url"
                value={formularioQuestao.link_explicacao}
                onChange={(event) =>
                  atualizarCampoQuestao("link_explicacao", event.target.value)
                }
                placeholder="https://"
              />
            </label>

            <div className={styles.modalActions}>
              <button type="submit" disabled={salvandoQuestao}>
                {salvandoQuestao ? (
                  <Loader2 className={styles.spinner} size={18} />
                ) : (
                  <Save size={18} />
                )}
                <span>{salvandoQuestao ? "Salvando..." : "Salvar"}</span>
              </button>

              <button
                type="button"
                className={styles.secondaryButton}
                onClick={fecharFormularioQuestao}
              >
                <X size={18} />
                <span>Cancelar</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  Database,
  FileText,
  GraduationCap,
  RefreshCw,
  Search,
} from "lucide-react";
import { getUsuarioLogado } from "../../hooks/auth";
import useApi from "../../hooks/useApi";
import styles from "./Home.module.css";

function getTotalComFallback(data) {
  return Array.isArray(data) ? data.length : 0;
}

function getPeriodo(anos) {
  const valores = anos
    .map((item) => Number(item.ano))
    .filter((ano) => Number.isInteger(ano));

  if (valores.length === 0) {
    return "Sem anos";
  }

  return `${Math.min(...valores)} - ${Math.max(...valores)}`;
}

export default function Home({ onNavigate }) {
  const usuario = getUsuarioLogado();
  const {
    data: apiInfo,
    loading: carregandoApi,
    error: erroApi,
    reload: recarregarApi,
  } = useApi("/api");
  const {
    data: questoes,
    loading: carregandoQuestoes,
    error: erroQuestoes,
    reload: recarregarQuestoes,
  } = useApi("/api/questoes");
  const { data: anos } = useApi("/api/questoes/anos");
  const { data: vestibulares } = useApi("/api/questoes/vestibulares");

  const carregando = carregandoApi || carregandoQuestoes;
  const totalQuestoes = getTotalComFallback(questoes);
  const totalVestibulares = getTotalComFallback(vestibulares);
  const periodo = getPeriodo(anos);
  const api = apiInfo[0];

  function recarregarTudo() {
    recarregarApi();
    recarregarQuestoes();
  }

  return (
    <main className={styles.page}>
      <section className={styles.headerBand}>
        <div>
          <span className={styles.eyebrow}>Painel de estudos</span>
          <h1>Visao geral do acervo de matematica</h1>
          <p>
            Acompanhe os dados carregados do PostgreSQL e acesse rapidamente as
            consultas de questoes do projeto.
          </p>
        </div>

        <div className={styles.userBox}>
          <span>Usuario conectado</span>
          <strong>{usuario?.email || "Sessao ativa"}</strong>
          <button type="button" onClick={recarregarTudo}>
            <RefreshCw size={18} />
            <span>Atualizar</span>
          </button>
        </div>
      </section>

      <section className={styles.metrics} aria-label="Resumo do acervo">
        <article>
          <BookOpenCheck size={22} />
          <span>Questoes</span>
          <strong>{carregandoQuestoes ? "..." : totalQuestoes}</strong>
        </article>

        <article>
          <GraduationCap size={22} />
          <span>Vestibulares</span>
          <strong>{totalVestibulares || "0"}</strong>
        </article>

        <article>
          <CalendarDays size={22} />
          <span>Periodo</span>
          <strong>{periodo}</strong>
        </article>

        <article>
          <Database size={22} />
          <span>API</span>
          <strong>{erroApi ? "Indisponivel" : carregandoApi ? "..." : "Online"}</strong>
        </article>
      </section>

      <section className={styles.workspace}>
        <div className={styles.primaryPanel}>
          <div className={styles.panelHeader}>
            <span>Fluxo principal</span>
            <h2>Pesquisar e montar lista</h2>
          </div>

          <div className={styles.actionRows}>
            <button type="button" onClick={() => onNavigate("/questoes")}>
              <Search size={20} />
              <span>Buscar questoes</span>
              <ArrowRight size={18} />
            </button>

            <button type="button" onClick={() => onNavigate("/funcionamento")}>
              <FileText size={20} />
              <span>Ver guia do projeto</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <aside className={styles.statusPanel}>
          <div className={styles.panelHeader}>
            <span>Status</span>
            <h2>Conexao com backend</h2>
          </div>

          <dl className={styles.statusList}>
            <div>
              <dt>Mensagem</dt>
              <dd>{api?.mensagem || (erroApi ? erroApi : "Aguardando API")}</dd>
            </div>

            <div>
              <dt>Versao</dt>
              <dd>{api?.versao || "-"}</dd>
            </div>

            <div>
              <dt>Questoes</dt>
              <dd>{erroQuestoes ? erroQuestoes : `${totalQuestoes} carregadas`}</dd>
            </div>
          </dl>

          {carregando && <p className={styles.loading}>Carregando dados...</p>}
        </aside>
      </section>
    </main>
  );
}

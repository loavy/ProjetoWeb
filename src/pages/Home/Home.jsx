import {
  ArrowRight,
  Building2,
  Package,
  RefreshCw,
  ShieldCheck,
  Warehouse,
} from "lucide-react";
import { getUsuarioLogado } from "../../hooks/auth";
import useApi from "../../hooks/useApi";
import styles from "./Home.module.css";

// Helpers locais para calcular totais exibidos no dashboard.
function getTotal(data) {
  return Array.isArray(data) ? data.length : 0;
}

function calcularEstoque(products) {
  // Soma a quantidade em estoque de todos os produtos retornados pela API.
  return products.reduce(
    (total, product) => total + Number(product.quantidade_estoque || 0),
    0,
  );
}

export default function Home({ onNavigate }) {
  const usuario = getUsuarioLogado();
  // Consulta 3 endpoints diferentes: status da API, empresas e produtos.
  const {
    data: apiInfo,
    loading: carregandoApi,
    error: erroApi,
    reload: recarregarApi,
  } = useApi("/api");
  const {
    data: companies,
    loading: carregandoCompanies,
    error: erroCompanies,
    reload: recarregarCompanies,
  } = useApi("/api/companies");
  const {
    data: products,
    loading: carregandoProducts,
    error: erroProducts,
    reload: recarregarProducts,
  } = useApi("/api/products");

  const carregando = carregandoApi || carregandoCompanies || carregandoProducts;
  const totalCompanies = getTotal(companies);
  const totalProducts = getTotal(products);
  const totalEstoque = calcularEstoque(products);
  const api = apiInfo[0];

  function recarregarTudo() {
    recarregarApi();
    recarregarCompanies();
    recarregarProducts();
  }

  return (
    <main className={styles.page}>
      <section className={styles.headerBand}>
        <div>
          <span className={styles.eyebrow}>Dashboard SGF</span>
          <h1>Gestao de fornecedores e produtos</h1>
          <p>
            Controle empresas fornecedoras, cadastre produtos vinculados a cada
            empresa e acompanhe o estoque geral do sistema.
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

      <section className={styles.metrics} aria-label="Resumo do SGF">
        <article>
          <Building2 size={22} />
          <span>Empresas</span>
          <strong>{carregandoCompanies ? "..." : totalCompanies}</strong>
        </article>

        <article>
          <Package size={22} />
          <span>Produtos</span>
          <strong>{carregandoProducts ? "..." : totalProducts}</strong>
        </article>

        <article>
          <Warehouse size={22} />
          <span>Itens em estoque</span>
          <strong>{carregandoProducts ? "..." : totalEstoque}</strong>
        </article>

        <article>
          <ShieldCheck size={22} />
          <span>API protegida</span>
          <strong>{erroApi ? "Falha" : carregandoApi ? "..." : "Online"}</strong>
        </article>
      </section>

      <section className={styles.workspace}>
        <div className={styles.primaryPanel}>
          <div className={styles.panelHeader}>
            <span>Fluxo principal</span>
            <h2>Cadastre empresas antes dos produtos</h2>
          </div>

          <div className={styles.actionRows}>
            <button type="button" onClick={() => onNavigate("/empresas")}>
              <Building2 size={20} />
              <span>Gerenciar empresas</span>
              <ArrowRight size={18} />
            </button>

            <button type="button" onClick={() => onNavigate("/produtos")}>
              <Package size={20} />
              <span>Gerenciar produtos</span>
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
              <dt>Empresas</dt>
              <dd>
                {erroCompanies ? erroCompanies : `${totalCompanies} cadastrada(s)`}
              </dd>
            </div>

            <div>
              <dt>Produtos</dt>
              <dd>{erroProducts ? erroProducts : `${totalProducts} cadastrado(s)`}</dd>
            </div>
          </dl>

          {carregando && <p className={styles.loading}>Carregando dados...</p>}
        </aside>
      </section>
    </main>
  );
}

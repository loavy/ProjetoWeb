import {
  BookOpenCheck,
  ChevronDown,
  Database,
  FileDown,
  Filter,
  Search,
} from "lucide-react";
import { useState } from "react";
import busca from "../../assets/ComoFuncionaImgs/busca.png";
import depoisResposta from "../../assets/ComoFuncionaImgs/depoisR.png";
import filtro from "../../assets/ComoFuncionaImgs/filtro.png";
import home from "../../assets/ComoFuncionaImgs/home.png";
import pdf from "../../assets/ComoFuncionaImgs/pdf.png";
import styles from "./ComoFunciona.module.css";

const etapas = [
  {
    id: "painel",
    titulo: "Painel",
    icon: Database,
    texto:
      "A tela inicial resume a API, a quantidade de questoes carregadas e os atalhos principais do sistema.",
    imagem: home,
  },
  {
    id: "busca",
    titulo: "Busca",
    icon: Search,
    texto:
      "A biblioteca permite procurar por palavras do enunciado e combinar filtros para reduzir o resultado.",
    imagem: busca,
  },
  {
    id: "filtros",
    titulo: "Filtros",
    icon: Filter,
    texto:
      "ID, vestibular, nivel e ano trabalham juntos para localizar exatamente o recorte de estudo desejado.",
    imagem: filtro,
  },
  {
    id: "revisao",
    titulo: "Revisao",
    icon: BookOpenCheck,
    texto:
      "Ao abrir uma questao, o painel lateral mostra enunciado, alternativas, resposta correta e explicacao.",
    imagem: depoisResposta,
  },
  {
    id: "pdf",
    titulo: "PDF",
    icon: FileDown,
    texto:
      "Uma questao individual ou uma selecao inteira pode ser exportada para PDF para estudo offline.",
    imagem: pdf,
  },
];

export default function ComoFunciona() {
  const [aberta, setAberta] = useState(etapas[0].id);

  return (
    <main className={styles.page}>
      <section className={styles.headerBand}>
        <span>Guia do projeto</span>
        <h1>Fluxo de uso da plataforma</h1>
        <p>
          O frontend consome as rotas do Express, que leem dados do PostgreSQL e
          retornam as questoes organizadas para consulta e revisao.
        </p>
      </section>

      <section className={styles.timeline}>
        {etapas.map((etapa, index) => {
          const Icon = etapa.icon;
          const ativa = aberta === etapa.id;

          return (
            <article className={ativa ? styles.active : ""} key={etapa.id}>
              <button type="button" onClick={() => setAberta(ativa ? "" : etapa.id)}>
                <strong>{String(index + 1).padStart(2, "0")}</strong>
                <Icon size={20} />
                <span>{etapa.titulo}</span>
                <ChevronDown size={20} />
              </button>

              {ativa && (
                <div className={styles.stepBody}>
                  <p>{etapa.texto}</p>
                  <img src={etapa.imagem} alt={`Tela de ${etapa.titulo}`} />
                </div>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}

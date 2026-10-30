import type { Metadata } from "next";
import { LegalPage, Todo } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Termos de Uso — CartaVirtual" };

export default function TermosPage() {
  return (
    <LegalPage title="Termos de Uso" updatedAt="outubro de 2026">
      <p>
        Estes termos regulam o uso do CartaVirtual, serviço operado por <Todo>RAZÃO SOCIAL / NOME</Todo>,
        CNPJ <Todo>CNPJ</Todo>. Ao criar ou enviar uma carta, você concorda com o que está escrito aqui.
      </p>

      <h2>1. O que é o serviço</h2>
      <p>
        O CartaVirtual permite criar uma carta digital interativa (texto, carrossel de mensagens, raspadinha,
        pergunta final, foto e música) e compartilhar com outra pessoa por meio de um link exclusivo.
      </p>

      <h2>2. Quem usa</h2>
      <ul>
        <li>Quem cria a carta (“remetente”) precisa ter 18 anos ou mais, ou autorização de responsável legal.</li>
        <li>Quem recebe o link (“destinatário”) apenas visualiza a carta e não precisa de cadastro.</li>
      </ul>

      <h2>3. Conteúdo da carta</h2>
      <p>O remetente é o único responsável pelo que escreve, pela foto e pela música que inclui. É proibido usar o serviço para:</p>
      <ul>
        <li>assediar, ameaçar, constranger ou perseguir alguém, inclusive insistindo depois de uma recusa;</li>
        <li>enviar conteúdo ilegal, ofensivo, sexual sem consentimento ou que envolva menores;</li>
        <li>usar foto ou dados de terceiros sem autorização;</li>
        <li>se passar por outra pessoa.</li>
      </ul>
      <p>
        Podemos remover cartas que violem estas regras, sem aviso prévio e sem reembolso, e colaborar com
        autoridades quando houver obrigação legal.
      </p>

      <h2>4. Planos, preço e pagamento</h2>
      <p>
        Os valores e o que cada plano inclui aparecem na tela de pagamento antes da compra. O pagamento é
        processado pelo Mercado Pago (PIX ou cartão). O link só é liberado depois da confirmação do pagamento.
O plano grátis inclui 1 tema, 1 slide no carrossel, raspadinha e pergunta final, com link que
        expira 2 dias após a criação (depois disso, o link deixa de abrir). Outros temas, mais slides, foto,
        música do Spotify, troca de fonte e link permanente são funcionalidades do plano pago.
        </p>

      <h2>5. Arrependimento e reembolso</h2>
      <p>
        <Todo>
          REVISAR COM ADVOGADO: política de reembolso. O Código de Defesa do Consumidor prevê arrependimento em
          até 7 dias para compras online; por ser um serviço digital liberado na hora, defina aqui como será
          tratado (ex.: reembolso integral em até 7 dias se a carta ainda não foi aberta pelo destinatário).
        </Todo>
      </p>

      <h2>6. Disponibilidade</h2>
      <p>
        Trabalhamos para manter o serviço no ar, mas não garantimos funcionamento ininterrupto. Podemos
        alterar ou encerrar funcionalidades, respeitando o que já foi pago.
      </p>

      <h2>7. Responsabilidade</h2>
      <p>
        Não nos responsabilizamos pela reação do destinatário, pelo conteúdo escrito pelo remetente nem por
        links compartilhados por terceiros. Nossa responsabilidade, quando existir, fica limitada ao valor pago
        pela carta, na extensão permitida em lei.
      </p>

      <h2>8. Privacidade</h2>
      <p>
        O tratamento de dados pessoais está descrito na <a className="underline" href="/privacidade">Política de Privacidade</a>.
      </p>

      <h2>9. Contato e foro</h2>
      <p>
        Dúvidas e solicitações: <Todo>E-MAIL DE CONTATO</Todo>. Fica eleito o foro da comarca de{" "}
        <Todo>CIDADE/UF</Todo>, ressalvado o direito do consumidor de acionar o foro de seu domicílio.
      </p>
    </LegalPage>
  );
}

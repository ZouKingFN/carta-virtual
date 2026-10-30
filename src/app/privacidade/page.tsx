import type { Metadata } from "next";
import { LegalPage, Todo } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Política de Privacidade — CartaVirtual" };

export default function PrivacidadePage() {
  return (
    <LegalPage title="Política de Privacidade" updatedAt="outubro de 2026">
      <p>
        Esta política explica como o CartaVirtual, operado por <Todo>RAZÃO SOCIAL / NOME</Todo> (CNPJ{" "}
        <Todo>CNPJ</Todo>), trata dados pessoais, conforme a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018).
      </p>

      <h2>1. Quais dados tratamos</h2>
      <ul>
        <li>
          <strong>Conteúdo da carta:</strong> nome de quem envia e de quem recebe, textos, pergunta final,
          foto, link de música e escolhas de aparência.
        </li>
        <li>
          <strong>Pagamento:</strong> status e identificador da transação. Dados de cartão ou PIX ficam com o
          Mercado Pago; nós não armazenamos número de cartão.
        </li>
        <li>
          <strong>Conta e contato:</strong> e-mail, quando houver cadastro ou envio de comprovante.{" "}
          <Todo>AJUSTAR quando o login estiver definido</Todo>
        </li>
        <li>
          <strong>Dados técnicos:</strong> registros de acesso (como data e hora, tipo de navegador e IP) e
          eventos da carta, como abertura e resposta. <Todo>CONFIRMAR quais eventos serão realmente gravados</Todo>
        </li>
      </ul>

      <h2>2. Para que usamos</h2>
      <ul>
        <li>Criar, armazenar e exibir a carta ao destinatário pelo link.</li>
        <li>Processar o pagamento e liberar o acesso.</li>
        <li>Avisar o remetente sobre a abertura e a resposta da carta, se esse recurso for ativado.</li>
        <li>Garantir segurança, prevenir fraudes e cumprir obrigações legais.</li>
      </ul>

      <h2>3. Base legal</h2>
      <p>
        Execução do contrato com quem cria a carta, cumprimento de obrigação legal e legítimo interesse para
        segurança e prevenção a abusos. Quando necessário, pediremos consentimento.
      </p>

      <h2>4. Quem recebe os dados</h2>
      <ul>
        <li>Provedores de infraestrutura e armazenamento (hospedagem e banco de dados): <Todo>CONFIRMAR: Vercel / Supabase</Todo>.</li>
        <li>Mercado Pago, para o pagamento.</li>
        <li>Autoridades, quando houver ordem legal.</li>
      </ul>
      <p>Não vendemos dados pessoais.</p>

      <h2>5. A carta é acessível por link</h2>
      <p>
        Qualquer pessoa que tenha o link consegue abrir a carta. Por isso, o remetente deve compartilhar o link
        apenas com quem deseja. As páginas das cartas não são indexadas por buscadores.
      </p>

      <h2>6. Fotos e dados de terceiros</h2>
      <p>
        Ao incluir foto ou informações de outra pessoa, o remetente declara ter autorização para isso.
      </p>

      <h2>7. Por quanto tempo guardamos</h2>
      <p>
        Mantemos a carta enquanto o serviço estiver ativo ou até pedido de exclusão. Registros de pagamento
        podem ser guardados pelo prazo exigido em lei. <Todo>DEFINIR prazos</Todo>
      </p>

      <h2>8. Seus direitos</h2>
      <p>
        Você pode pedir confirmação de tratamento, acesso, correção, anonimização, portabilidade, exclusão e
        informações sobre compartilhamento, além de revogar consentimento. Para exercer qualquer direito, escreva
        para <Todo>E-MAIL DO ENCARREGADO / CONTATO</Todo>. Você também pode recorrer à Autoridade Nacional de
        Proteção de Dados (ANPD).
      </p>

      <h2>9. Segurança</h2>
      <p>
        Usamos conexão criptografada (HTTPS) e controle de acesso. Nenhum sistema é 100% seguro, e vamos
        comunicar incidentes relevantes conforme a lei.
      </p>

      <h2>10. Mudanças</h2>
      <p>Podemos atualizar esta política. A data de revisão fica no topo da página.</p>
    </LegalPage>
  );
}

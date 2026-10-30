import { MercadoPagoConfig, Payment } from "mercadopago";

export interface CreatePixInput {
  amount: number;
  description: string;
  payerEmail: string;
  payerName?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface PixPaymentResult {
  id: string;
  status: string;
  qrCode: string;
  qrCodeBase64: string;
  ticketUrl?: string;
  expiresAt?: string;
}

/** Inicializa o cliente do Mercado Pago com o token do servidor */
export function getMercadoPagoClient() {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error("MERCADO_PAGO_ACCESS_TOKEN não configurado no ambiente.");
  }
  return new MercadoPagoConfig({ accessToken: token });
}

/** Gera uma cobrança via PIX no Mercado Pago */
export async function createPixPayment(input: CreatePixInput): Promise<PixPaymentResult> {
  const client = getMercadoPagoClient();
  const payment = new Payment(client);

  const res = await payment.create({
    body: {
      transaction_amount: Number(input.amount.toFixed(2)),
      description: input.description,
      payment_method_id: "pix",
      payer: {
        email: input.payerEmail,
        first_name: input.payerName || "Cliente",
      },
      metadata: input.metadata,
    },
  });

  const transactionData = res.point_of_interaction?.transaction_data;
  if (!res.id || !transactionData?.qr_code) {
    throw new Error("Não foi possível gerar os dados do QR Code PIX.");
  }

  return {
    id: String(res.id),
    status: res.status || "pending",
    qrCode: transactionData.qr_code,
    qrCodeBase64: transactionData.qr_code_base64 || "",
    ticketUrl: transactionData.ticket_url,
    expiresAt: res.date_of_expiration,
  };
}

/** Consulta o status de um pagamento pelo ID */
export async function getPaymentStatus(paymentId: string) {
  const client = getMercadoPagoClient();
  const payment = new Payment(client);
  const res = await payment.get({ id: paymentId });
  return {
    id: String(res.id),
    status: res.status, // approved, pending, rejected, etc.
    metadata: res.metadata,
    statusDetail: res.status_detail,
  };
}

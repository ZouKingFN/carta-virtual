-- ==============================================================================
-- CartaVirtual — configuração do Supabase (rode este arquivo UMA vez)
-- Painel Supabase → SQL Editor → New query → cole tudo → Run.
--
-- Substitui schema.sql e 002_letters_content.sql (pode apagar os dois).
--
-- SEGURANÇA: as tabelas ficam com RLS ligado e SEM nenhuma policy. Isso significa
-- que a chave pública (anon) não lê nem escreve nada. Quem acessa os dados é só o
-- servidor do site, com a SERVICE_ROLE key (que nunca vai para o navegador).
-- ==============================================================================

-- 1) Cartas ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.letters (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug               TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9][a-z0-9-]{0,59}$'),
    user_id            UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- login (próxima etapa)
    plan               TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'paid')),
    content            JSONB NOT NULL,           -- a carta inteira (textos, tema, fonte, slides...)
    manage_token_hash  TEXT NOT NULL,            -- hash do código do painel de acompanhamento
    expires_at         TIMESTAMPTZ,              -- preenchido só no plano grátis (2 dias)
    paid_at            TIMESTAMPTZ,
    payment_id         TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Acompanhamento
    opened_at          TIMESTAMPTZ,
    open_count         INT NOT NULL DEFAULT 0,
    accepted_at        TIMESTAMPTZ,
    no_attempts        INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS letters_expires_at_idx ON public.letters (expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS letters_user_id_idx ON public.letters (user_id);

-- 2) Pagamentos (Mercado Pago — etapa seguinte) ---------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    letter_id                UUID REFERENCES public.letters(id) ON DELETE CASCADE,
    mercado_pago_payment_id  TEXT UNIQUE,
    status                   TEXT NOT NULL DEFAULT 'pending',   -- pending | approved | rejected
    amount                   NUMERIC(10, 2) NOT NULL,
    payment_method           TEXT DEFAULT 'pix',
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3) Segurança: RLS ligado e nenhuma policy = só o servidor (service_role) acessa -
ALTER TABLE public.letters  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.letters, public.payments FROM anon, authenticated;

-- 4) Registro de eventos de forma atômica (evita perder contagem em acessos simultâneos)
CREATE OR REPLACE FUNCTION public.record_letter_event(
    p_slug TEXT, p_type TEXT, p_no_attempts INT DEFAULT 0
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF p_type = 'open' THEN
        UPDATE letters
           SET open_count = open_count + 1,
               opened_at  = COALESCE(opened_at, NOW())
         WHERE slug = p_slug;
    ELSIF p_type = 'yes' THEN
        UPDATE letters
           SET accepted_at = COALESCE(accepted_at, NOW()),
               no_attempts = GREATEST(no_attempts, LEAST(GREATEST(p_no_attempts, 0), 9999))
         WHERE slug = p_slug;
    ELSE
        RETURN FALSE;
    END IF;
    RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.record_letter_event(TEXT, TEXT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_letter_event(TEXT, TEXT, INT) TO service_role;

-- 5) Fotos: bucket público para leitura (o endereço de cada foto é imprevisível);
--    gravação só pelo servidor, porque nenhuma policy de escrita é criada.
INSERT INTO storage.buckets (id, name, public)
VALUES ('letter-photos', 'letter-photos', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- Schema SQL Inicial do CartaVirtual (Supabase PostgreSQL)
-- Execute no Editor SQL do seu painel Supabase
-- ==============================================================================

-- 1. Habilitar extensão de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Cartas (Letters)
CREATE TABLE IF NOT EXISTS public.letters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(120) UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sender_name VARCHAR(100) NOT NULL,
    recipient_name VARCHAR(100) NOT NULL,
    question TEXT NOT NULL,
    letter_text TEXT NOT NULL,
    accent_note TEXT,
    template_id VARCHAR(50) NOT NULL DEFAULT 'teal-whisper',
    font_id VARCHAR(50) NOT NULL DEFAULT 'cormorant',
    photo_url TEXT,
    spotify_url TEXT,
    runaway_intensity VARCHAR(20) DEFAULT 'normal',
    
    -- Status de Pagamento e Liberação
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    plan_type VARCHAR(20) DEFAULT 'single', -- 'single' ou 'pack'
    payment_id VARCHAR(120),
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Analytics
    views_count INT NOT NULL DEFAULT 0,
    said_yes BOOLEAN NOT NULL DEFAULT FALSE,
    said_yes_at TIMESTAMP WITH TIME ZONE,
    evade_count INT NOT NULL DEFAULT 0,
    
    -- Segurança e Expiração
    secret_token VARCHAR(64) NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Pagamentos e Webhooks (Mercado Pago)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    letter_id UUID REFERENCES public.letters(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    mercado_pago_payment_id VARCHAR(100) UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'pix',
    qr_code TEXT,
    qr_code_base64 TEXT,
    ticket_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de Segurança (RLS)
-- Qualquer pessoa pode LER uma carta SE ela estiver com is_paid = true
CREATE POLICY "Cartas pagas são públicas pelo slug"
    ON public.letters FOR SELECT
    USING (is_paid = TRUE);

-- O criador autenticado pode ler suas próprias cartas mesmo antes de pagar
CREATE POLICY "Usuários podem gerenciar suas próprias cartas"
    ON public.letters FOR ALL
    USING (auth.uid() = user_id);

-- Somente o backend (service_role) atualiza pagamentos
CREATE POLICY "Apenas serviço atualiza pagamentos"
    ON public.payments FOR ALL
    USING (auth.role() = 'service_role');

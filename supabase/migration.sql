-- ============================================
-- Migration: Criar tabelas e RLS policies
-- ============================================

-- 1. TABELA eventos
CREATE TABLE IF NOT EXISTS public.eventos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome text NOT NULL,
    endereco text DEFAULT '',
    linhas integer DEFAULT 17,
    colunas integer DEFAULT 11,
    largura_palco numeric DEFAULT 400,
    altura_palco numeric DEFAULT 120,
    distancia_mesas numeric DEFAULT 80,
    espacamento_horizontal numeric DEFAULT 12,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios podem ver seus proprios eventos"
    ON public.eventos FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuarios podem criar seus proprios eventos"
    ON public.eventos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios podem atualizar seus proprios eventos"
    ON public.eventos FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios podem deletar seus proprios eventos"
    ON public.eventos FOR DELETE
    USING (auth.uid() = user_id);

-- 2. TABELA mesas
CREATE TABLE IF NOT EXISTS public.mesas (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    evento_id uuid NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
    numero_mesa integer NOT NULL,
    numero_pessoas integer,
    nome_comprador text,
    nomes_pessoas jsonb DEFAULT '[]'::jsonb,
    contato text,
    ocupada boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.mesas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios podem ver mesas dos seus eventos"
    ON public.mesas FOR SELECT
    USING (evento_id IN (SELECT id FROM public.eventos WHERE auth.uid() = user_id));

CREATE POLICY "Usuarios podem inserir mesas nos seus eventos"
    ON public.mesas FOR INSERT
    WITH CHECK (evento_id IN (SELECT id FROM public.eventos WHERE auth.uid() = user_id));

CREATE POLICY "Usuarios podem atualizar mesas dos seus eventos"
    ON public.mesas FOR UPDATE
    USING (evento_id IN (SELECT id FROM public.eventos WHERE auth.uid() = user_id));

CREATE POLICY "Usuarios podem deletar mesas dos seus eventos"
    ON public.mesas FOR DELETE
    USING (evento_id IN (SELECT id FROM public.eventos WHERE auth.uid() = user_id));

-- 3. TABELA barraquinhas
CREATE TABLE IF NOT EXISTS public.barraquinhas (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    evento_id uuid NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
    item_id text NOT NULL,
    nome text NOT NULL,
    tipo text NOT NULL,
    x numeric NOT NULL,
    y numeric NOT NULL,
    largura numeric,
    altura numeric,
    cor text,
    observacao text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.barraquinhas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios podem ver barraquinhas dos seus eventos"
    ON public.barraquinhas FOR SELECT
    USING (evento_id IN (SELECT id FROM public.eventos WHERE auth.uid() = user_id));

CREATE POLICY "Usuarios podem inserir barraquinhas nos seus eventos"
    ON public.barraquinhas FOR INSERT
    WITH CHECK (evento_id IN (SELECT id FROM public.eventos WHERE auth.uid() = user_id));

CREATE POLICY "Usuarios podem atualizar barraquinhas dos seus eventos"
    ON public.barraquinhas FOR UPDATE
    USING (evento_id IN (SELECT id FROM public.eventos WHERE auth.uid() = user_id));

CREATE POLICY "Usuarios podem deletar barraquinhas dos seus eventos"
    ON public.barraquinhas FOR DELETE
    USING (evento_id IN (SELECT id FROM public.eventos WHERE auth.uid() = user_id));

-- 4. TABELA placas
CREATE TABLE IF NOT EXISTS public.placas (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    evento_id uuid NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
    placa_id text NOT NULL,
    texto text NOT NULL,
    cor text NOT NULL,
    x numeric NOT NULL,
    y numeric NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.placas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios podem ver placas dos seus eventos"
    ON public.placas FOR SELECT
    USING (evento_id IN (SELECT id FROM public.eventos WHERE auth.uid() = user_id));

CREATE POLICY "Usuarios podem inserir placas nos seus eventos"
    ON public.placas FOR INSERT
    WITH CHECK (evento_id IN (SELECT id FROM public.eventos WHERE auth.uid() = user_id));

CREATE POLICY "Usuarios podem atualizar placas dos seus eventos"
    ON public.placas FOR UPDATE
    USING (evento_id IN (SELECT id FROM public.eventos WHERE auth.uid() = user_id));

CREATE POLICY "Usuarios podem deletar placas dos seus eventos"
    ON public.placas FOR DELETE
    USING (evento_id IN (SELECT id FROM public.eventos WHERE auth.uid() = user_id));

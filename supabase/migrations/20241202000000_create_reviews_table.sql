CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id BIGINT NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    user_name TEXT, -- Denormalized for easier access
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_worker_review UNIQUE (user_id, worker_id)
);

-- RLS Policies for reviews table
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
ON public.reviews
FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON public.reviews
FOR INSERT
WITH CHECK (auth.role() = 'authenticated'); 
-- Extend districts for buyer-intent area guides
ALTER TABLE districts
    ADD COLUMN IF NOT EXISTS tagline text,
    ADD COLUMN IF NOT EXISTS summary text,
    ADD COLUMN IF NOT EXISTS price_band_min numeric,
    ADD COLUMN IF NOT EXISTS price_band_max numeric,
    ADD COLUMN IF NOT EXISTS plot_size_range text,
    ADD COLUMN IF NOT EXISTS why_buy text[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS watch_outs text[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS due_diligence text,
    ADD COLUMN IF NOT EXISTS geo_lat numeric,
    ADD COLUMN IF NOT EXISTS geo_lng numeric,
    ADD COLUMN IF NOT EXISTS commute_notes text;

-- Existing columns kept: description, avg_price_per_sqm, title_type_common, infrastructure_rating, pros, cons, landmarks, avg_price_history

-- SEO + publishing enhancements for blog_posts
-- Adds metadata fields, publishing state, scheduling, tags, and analytics helpers.

-- Core content/SEO fields
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS excerpt text;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS og_image_url text;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS focus_keyword text;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS canonical_url text;

-- Publishing state
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS status text;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS published_at timestamptz;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS scheduled_for timestamptz;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS noindex boolean DEFAULT false;

-- Discoverability helpers
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS reading_time integer;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS word_count integer;

-- Backfill status based on legacy "published" flag
UPDATE blog_posts
SET status = CASE
    WHEN published = true THEN 'published'
    ELSE 'draft'
END
WHERE status IS NULL;

-- If something is already published, set published_at to created_at if missing
UPDATE blog_posts
SET published_at = created_at
WHERE published = true
  AND published_at IS NULL;

-- Default values + constraint for status
ALTER TABLE blog_posts ALTER COLUMN status SET DEFAULT 'draft';
ALTER TABLE blog_posts ALTER COLUMN tags SET DEFAULT '{}';
ALTER TABLE blog_posts ALTER COLUMN noindex SET DEFAULT false;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'blog_posts_status_check'
    ) THEN
        ALTER TABLE blog_posts
            ADD CONSTRAINT blog_posts_status_check
            CHECK (status IN ('draft', 'scheduled', 'published'));
    END IF;
END;
$$;

-- RLS policies for blog posts (Postgres doesn't support IF NOT EXISTS on policies; guard via DO blocks)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'blog_posts'
          AND policyname = 'Blog posts are viewable by everyone'
    ) THEN
        CREATE POLICY "Blog posts are viewable by everyone"
            ON public.blog_posts FOR SELECT
            USING (true);
    END IF;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'blog_posts'
          AND policyname = 'Admins can manage blog posts'
    ) THEN
        CREATE POLICY "Admins can manage blog posts"
            ON public.blog_posts FOR ALL
            USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
            WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
    END IF;
END;
$$;

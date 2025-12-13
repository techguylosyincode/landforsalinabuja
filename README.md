This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Blog SEO migration

Run the SEO migration to add meta fields and publishing workflow to `blog_posts`:

```bash
psql "$SUPABASE_DB_URL" -f supabase/migration_blog_seo.sql
```

Notes:
- `SUPABASE_DB_URL` should be your Supabase connection string (service role recommended).
- Set `SUPABASE_SERVICE_KEY` in `.env.local` so server actions can write blog posts and upload covers.
- Create a `blog-assets` storage bucket in Supabase and allow admin users to write to it (for cover uploads).
- Restart `npm run dev` after updating environment variables.

Bucket setup helper:
```bash
psql "$SUPABASE_DB_URL" -f supabase/migration_blog_assets_policy.sql
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

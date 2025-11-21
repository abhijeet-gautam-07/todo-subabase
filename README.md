## Supabase Todo Dashboard

Next.js 16 (App Router) app that renders every page on the server, authenticates with Supabase Auth, stores data in Supabase Postgres, and uses shadcn UI components for a modern interface.

### Features

- Email/password login and signup powered by Supabase
- SSR dashboard with shadcn Tabs for Today, Pending, and Completed todos
- Server actions for create, update, delete, and toggle complete
- Admin panel to view every user, block/unblock, delete, and promote/demote admins
- Shared layout with Supabase-backed auth guard and middleware-based redirects

### Getting started

1. Install deps

   ```bash
   npm install
   ```

2. Create a Supabase project, then run the SQL in `supabase/schema.sql` inside the SQL editor to add the `profiles` and `todos` tables plus RLS policies.

3. Create `.env.local` in the project root and add:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

   Use the anon key for browser interactions and the service role key **only on the server** (admin mutations rely on it).

4. Start the dev server

   ```bash
   npm run dev
   ```

Open `http://localhost:3000`. The middleware will redirect visitors to `/login` until they authenticate; admins can access `/admin`.

# Supabase Setup Instructions

## 1. Environment Variables

Add these to your `.env.local` file:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
\`\`\`

Get these values from your Supabase project settings:
- Go to Project Settings > API
- Copy the Project URL and anon/public key

## 2. Install Dependencies

\`\`\`bash
npm install @supabase/ssr @supabase/supabase-js
\`\`\`

## 3. Run Database Scripts

In the v0 interface:
1. The SQL scripts are in the `scripts/` folder
2. Execute them in order:
   - `01-create-tables.sql`
   - `02-row-level-security.sql`
   - `03-seed-sample-data.sql`

Or run them manually in Supabase SQL Editor.

## 4. Setup Authentication

In Supabase Dashboard:
1. Go to Authentication > Providers
2. Enable Email provider
3. Configure email templates if desired
4. Set Site URL to your app URL

## 5. Security Best Practices

- **Never expose service_role key** in client-side code
- Use Row Level Security (RLS) policies (already configured)
- Always validate user permissions server-side
- Use server actions for sensitive operations

## 6. Using in Your App

### Client-side (for auth and reads):
\`\`\`typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data } = await supabase.from('recipes').select('*')
\`\`\`

### Server-side (for mutations):
\`\`\`typescript
import { getAllRecipes, completeRecipe } from '@/lib/supabase/queries'

// Use the pre-built query functions
const recipes = await getAllRecipes()
\`\`\`

## 7. Authentication Flow

\`\`\`typescript
// Sign Up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
})

// Sign In
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
})

// Get Current User
const { data: { user } } = await supabase.auth.getUser()

// Sign Out
await supabase.auth.signOut()
\`\`\`

## 8. Next Steps

1. Connect Supabase integration in v0
2. Run the SQL scripts
3. Update your app components to use real database queries
4. Test authentication flow
5. Verify RLS policies are working
\`\`\`
</markdown>

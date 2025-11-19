# Supabase Connection Debugging Guide

## Step 1: Check Environment Variables

### In Browser Console (F12 → Console tab)

Run these commands to check if your environment variables are loaded:

\`\`\`javascript
console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log("Supabase Key exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
\`\`\`

**Expected Result:**
- Should show your Supabase URL (https://xxxxx.supabase.co)
- Should show `true` for the key

**If you see `undefined`:**
1. Check that `.env.local` file exists in your project root
2. Verify the file contains:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   \`\`\`
3. Stop your dev server (Ctrl+C)
4. Restart it: `npm run dev`

---

## Step 2: Test Supabase Connection

### Open Browser Console and run:

\`\`\`javascript
// Test if Supabase client can be created
const { createBrowserClient } = require('@supabase/ssr')
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Try to fetch recipes
supabase.from('recipes').select('*').then(result => {
  console.log("Recipes:", result)
})
\`\`\`

**Expected Result:**
- Should show recipes data
- `error: null`

**If you get an error:**
- Check your Supabase project is active (not paused)
- Verify RLS policies are set up correctly
- Check your Supabase dashboard → Table Editor → recipes table exists

---

## Step 3: Monitor Registration Flow

### When you click "Register":

Watch the browser console for these messages:

\`\`\`
[v0] Starting register process...
[v0] Form data: {name: "...", email: "...", password: "..."}
[v0] Supabase URL: https://xxxxx.supabase.co
[v0] Supabase Key exists: true
[v0] Attempting Supabase registration...
[v0] Supabase registration response: {data: {...}, error: null}
[v0] Registration successful! User ID: xxxxx-xxxxx-xxxxx
\`\`\`

**Common Errors:**

### Error: "Invalid API key"
- Your `NEXT_PUBLIC_SUPABASE_ANON_KEY` is wrong
- Copy it again from Supabase dashboard → Settings → API

### Error: "Email rate limit exceeded"
- Supabase free tier has email limits
- Wait a few minutes or use different email
- Or check Supabase dashboard → Authentication → Rate Limits

### Error: "User already registered"
- That email is already in use
- Go to Supabase dashboard → Authentication → Users
- Delete the user or use a different email

### Error: "Failed to fetch"
- Network issue or Supabase is down
- Check internet connection
- Verify Supabase project URL is correct

---

## Step 4: Check Database Insertion

### After completing health form:

Watch console for:

\`\`\`
[v0] Submitting health information...
[v0] Current user: {id: "xxxxx", email: "..."}
[v0] Inserting profile data: {id: "xxxxx", name: "...", age: 25, ...}
[v0] Profile insert response: {data: [...], error: null}
[v0] Profile saved successfully!
\`\`\`

### Verify in Supabase Dashboard:

1. Go to **Table Editor**
2. Click **user_profiles** table
3. You should see your data

**If no data appears:**
- Check RLS policies allow INSERT for authenticated users
- Go to Supabase → Authentication → Policies
- Verify "Users can insert own profile" policy exists

---

## Step 5: Common Environment Variable Issues

### Problem: Changes to .env.local not working

**Solution:**
\`\`\`bash
# Stop server
Ctrl + C

# Delete Next.js cache
rm -rf .next

# Restart server
npm run dev
\`\`\`

### Problem: .env.local file not being read

**Check file location:**
\`\`\`
your-project/
├── .env.local          ← Should be here (root folder)
├── app/
├── lib/
└── package.json
\`\`\`

**NOT here:**
\`\`\`
your-project/
├── app/
│   └── .env.local      ← WRONG! Not in app folder
\`\`\`

---

## Step 6: Test Each Function Individually

### Test Registration Only:

\`\`\`javascript
// In browser console
const supabase = createClient()

supabase.auth.signUp({
  email: 'test@example.com',
  password: 'testpassword123',
  options: {
    data: { name: 'Test User' }
  }
}).then(result => console.log('Sign up result:', result))
\`\`\`

### Test Profile Insert Only:

\`\`\`javascript
// First, get current user
supabase.auth.getUser().then(({ data: { user } }) => {
  console.log('Current user:', user)
  
  // Then try to insert profile
  supabase.from('user_profiles').upsert({
    id: user.id,
    name: 'Test Name',
    age: 25,
    height: 170,
    health_issues: ['none']
  }).then(result => console.log('Profile insert:', result))
})
\`\`\`

---

## Step 7: Verify RLS Policies

Go to Supabase Dashboard → Table Editor → user_profiles → RLS Policies

You should see these policies:
- ✅ "Users can insert own profile" (INSERT)
- ✅ "Users can view own profile" (SELECT)  
- ✅ "Users can update own profile" (UPDATE)

If missing, run the script: `scripts/02-row-level-security.sql`

---

## Quick Checklist

- [ ] `.env.local` file exists in project root
- [ ] Contains correct `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Contains correct `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Dev server restarted after adding env vars
- [ ] Supabase project is active (not paused)
- [ ] Database tables created (run scripts/01-create-tables.sql)
- [ ] RLS policies created (run scripts/02-row-level-security.sql)
- [ ] Browser console shows `[v0]` debug messages
- [ ] No errors in browser console

---

## Still Not Working?

Share these details:

1. **Console output** - Copy all `[v0]` messages
2. **Error messages** - Exact error text
3. **Environment check** - Result of checking env vars
4. **Supabase dashboard** - Screenshot of Authentication → Users page
5. **Table data** - Screenshot of Table Editor → user_profiles

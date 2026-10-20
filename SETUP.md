# FORGE Gym Tracker v3 — access from anywhere

This is a static website with optional private Supabase cloud syncing. You need to deploy it and create a Supabase account/project; neither has been done for you.

## 1. Create a Supabase project

1. Visit https://supabase.com/dashboard and create a project.
2. In **SQL Editor**, run the contents of `supabase.sql` once. It creates a `gym_data` table protected by per-user Row Level Security policies.
3. In project settings, find the **Project URL** and **publishable key** (or legacy **anon** key). Never use the `service_role` or secret key in a browser.
4. In **Authentication → Providers**, enable email/password. Consider requiring email verification. In **Authentication → URL Configuration**, set the Site URL to your eventual hosted site and allow its redirect URL.

## 2. Publish the site

One option: create a free GitHub repository, upload `index.html` and `cloud.js` to its root, and enable **Settings → Pages → Deploy from a branch**. Your site will have an HTTPS URL. Alternatively deploy the same two files with Netlify or Cloudflare Pages. `supabase.sql` and this guide do not need to be public on the hosted site.

## 3. Connect your account

1. Open your hosted website on your phone or laptop.
2. Go to **Settings & Backup → Cloud account & sync**.
3. Paste the Supabase Project URL and publishable/anon key, then click **Save cloud configuration**.
4. Create an account with your email/password, verify your email if prompted, and sign in.
5. On the device containing your current workouts, choose **Upload this device's data**. On another device, sign in and choose **Download cloud data**.
6. Once initialized on a device, new workout changes are automatically uploaded while signed in and online.

## Important limitations

- This version uses a single cloud snapshot per account. It does **not** automatically merge edits from multiple devices. The most recently uploaded snapshot overwrites the previous snapshot. To avoid losing changes, download the latest cloud data before editing on a second device.
- The tracker keeps a local copy, and the cloud requires internet. If an upload fails, data remains on the device; retry uploading when connected.
- Cloud credentials and session are stored by your browser on each device. Keep your password private.
- Export a JSON backup periodically.
- Supabase and hosting may have free tiers, usage limits, and terms that change.
- The website uses the Supabase JavaScript client from a CDN; it requires internet for cloud functionality.

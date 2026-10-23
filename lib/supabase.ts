import { createClient } from '@supabase/supabase-js';

// One browser client with the public (publishable) key. Every read/write runs as the
// signed-in admin, so Supabase row-level security decides what is allowed: no secret
// key lives in this app.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// The public website, used for links and to preview site media (media/...) paths.
export const SITE_URL = 'https://mohsenkashefi.live';
export const siteAsset = (p?: string | null) =>
  !p ? '' : /^https?:\/\//.test(p) ? p : `${SITE_URL}/${p.replace(/^\//, '')}`;

export type PageView = {
  id: number;
  page_path: string;
  session_id: string | null;
  device_type: string | null;
  referrer: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  created_at: string;
};

export type Project = {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  technologies: string[] | null;
  github_url: string | null;
  live_url: string | null;
  image_path: string | null;
  is_featured: boolean | null;
  order_index: number | null;
  tags: string[];
  meta: string | null;
  accent: string | null;
  updated_at?: string;
};

export type Skill = {
  id: number;
  name: string;
  category: string | null;
  order_index: number | null;
  is_visible: boolean;
};

export type Experience = {
  id: number;
  kind: 'clip' | 'marker';
  lane: number;
  title: string;
  role: string | null;
  period_label: string | null;
  start_month: string; // YYYY-MM-01
  end_month: string | null; // null = now
  color: string | null;
  hollow: boolean;
  bullets: string[];
  order_index: number;
};

export type Message = {
  id: number;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: 'unread' | 'read' | 'replied';
  created_at: string;
};

export const TAGS = ['work', 'personal', 'web', 'mobile', 'ai'] as const;
export const LAYERS = ['AI', 'Mobile', 'Web', 'Backend', 'Data'] as const;
export const LANES = ['Work', 'Intern · Freelance · Indie', 'Study', 'Projects'] as const;

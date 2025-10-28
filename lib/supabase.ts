import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type PageView = {
  id: number;
  page_path: string;
  session_id?: string;
  user_agent?: string;
  country?: string;
  created_at: string;
};

export type Project = {
  id: number;
  title: string;
  description: string;
  category: string;
  technologies: string[];
  github_url?: string;
  live_url?: string;
  image_path?: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: number;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  created_at: string;
};

export type Skill = {
  id: number;
  name: string;
  percentage: number;
  category?: string;
  icon?: string;
  order_index: number;
  created_at: string;
};

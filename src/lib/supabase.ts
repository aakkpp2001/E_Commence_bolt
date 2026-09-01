import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Product = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  category_id: string | null;
  brand: string;
  images: string[];
  rating: number;
  review_count: number;
  stock: number;
  is_featured: boolean;
  is_deal: boolean;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon_name: string;
  parent_id: string | null;
  created_at: string;
};

export type Review = {
  id: string;
  product_id: string;
  user_id: string;
  author_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: Product;
};

export type Order = {
  id: string;
  user_id: string;
  status: string;
  total: number;
  shipping_address: Record<string, string>;
  items: Array<{ product_id: string; title: string; price: number; quantity: number; image: string }>;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name: string;
  phone: string;
  default_address: Record<string, string>;
  created_at: string;
};

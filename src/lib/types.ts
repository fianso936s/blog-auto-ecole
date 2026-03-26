export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  author: string;
  created_at: string;
  updated_at: string;
  published: boolean;
}

export interface Profile {
  id: string;
  email: string;
  role: "admin" | "user";
  full_name?: string;
  avatar_url?: string;
}

export interface AppUser {
  id: string;
  email: string;
  role: "admin" | "user";
  full_name?: string;
}

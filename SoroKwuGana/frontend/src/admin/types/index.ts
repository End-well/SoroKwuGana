export interface AdminUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'AUTHOR';
  avatar?: string;
  bio?: string;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: string;
  _count?: { posts: number };
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  published: boolean;
  featured: boolean;
  views: number;
  category: Category;
  author: Pick<AdminUser, 'name' | 'avatar'>;
  tags: { _id: string; name: string; slug: string }[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  approved: boolean;
  post: Pick<Post, '_id' | 'title' | 'slug'>;
  author?: Pick<AdminUser, 'name' | 'avatar'>;
  guestName?: string;
  guestEmail?: string;
  createdAt: string;
}

export interface Stats {
  totalPosts: number;
  published: number;
  drafts: number;
  pendingComments: number;
  totalUsers: number;
  totalCategories: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

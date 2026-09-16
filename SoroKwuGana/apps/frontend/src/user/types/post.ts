// Matches the MongoDB Post model shape returned by the backend API

export interface MediaItem {
  url: string;
  type: 'image' | 'video';
  caption?: string;
  source?: string;
}

export interface PostAuthor {
  _id: string;
  name: string;
  avatar?: string;
  bio?: string;
  role?: string;
}

export interface PostCategory {
  _id: string;
  name: string;
  slug: string;
  parent?: string;
}

export interface PostTag {
  _id: string;
  name: string;
  slug: string;
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  referenceImages: MediaItem[];
  videos: MediaItem[];
  published: boolean;
  featured: boolean;
  breaking: boolean;
  views: number;
  likes: number;
  rating?: number | null;        // admin editorial score
  userRatingAvg?: number | null; // community average
  userRatingCount?: number;      // how many readers rated
  category: PostCategory;
  author: PostAuthor;
  tags: PostTag[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedPosts {
  posts: Post[];
  total: number;
  page: number;
  pages: number;
}

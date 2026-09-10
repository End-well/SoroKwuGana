import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Stats, Post, Category, Comment, AdminUser } from '../types';

// ── Stats ─────────────────────────────────────────────────────────────────────
export function useStats() {
  return useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: () => api.get('/admin/stats').then(r => r.data),
    staleTime: 30_000,
  });
}

// ── Recent activity ───────────────────────────────────────────────────────────
export function useRecentActivity() {
  return useQuery<{ recentPosts: Post[]; recentComments: Comment[] }>({
    queryKey: ['recent'],
    queryFn: () => api.get('/admin/recent').then(r => r.data),
    staleTime: 30_000,
  });
}

// ── Posts ─────────────────────────────────────────────────────────────────────
export function useAdminPosts(params?: { page?: number; status?: string; search?: string; category?: string }) {
  return useQuery({
    queryKey: ['admin-posts', params],
    queryFn: () => api.get('/admin/posts', { params }).then(r => r.data),
    staleTime: 15_000,
  });
}

export function useAdminPost(id: string) {
  return useQuery<Post>({
    queryKey: ['admin-post', id],
    queryFn: () => api.get(`/admin/posts/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Post> & { categoryId: string; tags?: string[] }) =>
      api.post('/posts', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-posts'] }),
  });
}

export function useUpdatePost(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Post> & { categoryId?: string }) =>
      api.patch(`/posts/${id}`, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-posts'] });
      qc.invalidateQueries({ queryKey: ['admin-post', id] });
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/posts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-posts'] }),
  });
}

// ── Categories ────────────────────────────────────────────────────────────────
export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data),
    staleTime: 60_000,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Category, '_id'>) =>
      api.post('/categories', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      api.patch(`/categories/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

// ── Comments ──────────────────────────────────────────────────────────────────
export function useComments(params?: { page?: number; approved?: string; search?: string }) {
  return useQuery({
    queryKey: ['comments', params],
    queryFn: () => api.get('/comments', { params }).then(r => r.data),
    staleTime: 15_000,
  });
}

export function useApproveComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/comments/${id}/approve`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/comments/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

// ── Users ─────────────────────────────────────────────────────────────────────
export function useUsers(params?: { page?: number; role?: string; search?: string }) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => api.get('/users', { params }).then(r => r.data),
    staleTime: 30_000,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string; role: string }) =>
      api.post('/users', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useUpdateUser(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AdminUser>) =>
      api.patch(`/users/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

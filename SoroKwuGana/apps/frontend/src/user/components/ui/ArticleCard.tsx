import { Link } from 'react-router-dom';
import type { Post } from '../../types/post';
import { formatViews, formatDate } from '../../lib/utils';
import CategoryBadge from './CategoryBadge';

interface ArticleCardProps {
  post: Post;
  variant?: 'default' | 'horizontal' | 'minimal';
  index?: number;
}

export default function ArticleCard({ post, variant = 'default', index }: ArticleCardProps) {
  const category = post.category?.name ?? '';
  const categorySlug = post.category?.slug ?? '';

  if (variant === 'horizontal') {
    return (
      <Link to={`/article/${post.slug}`} className="group flex gap-3 items-start card-hover rounded-xl p-2 -mx-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors min-w-0">
        <div className="img-zoom flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
          {post.coverImage ? (
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">📰</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <CategoryBadge category={category} slug={categorySlug} />
          <h3 className="mt-1.5 font-bold text-sm text-gray-900 dark:text-white line-clamp-2 group-hover:text-[#6C63FF] transition-colors leading-snug">
            {post.title}
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)} · {post.content ? `${Math.max(1, Math.ceil(post.content.trim().split(/\s+/).length / 200))} min read` : ''}
          </p>
        </div>
      </Link>
    );
  }

  if (variant === 'minimal') {
    return (
      <Link to={`/article/${post.slug}`} className="group block">
        <div className="flex items-start gap-3">
          <span className="text-2xl font-black text-gray-200 dark:text-gray-700 leading-none pt-1 w-8 flex-shrink-0">
            {String(index !== undefined ? index + 1 : '').padStart(2, '0')}
          </span>
          <div>
            <CategoryBadge category={category} slug={categorySlug} />
            <h3 className="mt-1 font-bold text-sm text-gray-900 dark:text-white line-clamp-2 group-hover:text-[#6C63FF] transition-colors leading-snug">
              {post.title}
            </h3>
            <p className="mt-1 text-xs text-gray-500">{formatViews(post.views)} views</p>
          </div>
        </div>
      </Link>
    );
  }

  // Default card
  return (
    <Link to={`/article/${post.slug}`} className="group block card-hover rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="img-zoom relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-800">
        {post.coverImage ? (
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">📰</div>
        )}
        {post.breaking && (
          <span className="absolute top-3 left-3 bg-[#FF4D6D] text-white text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-dot" />
            Breaking
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <CategoryBadge category={category} slug={categorySlug} />
        </div>
        <h3 className="font-bold text-base text-gray-900 dark:text-white line-clamp-2 group-hover:text-[#6C63FF] dark:group-hover:text-[#6C63FF] transition-colors leading-snug">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{post.excerpt}</p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {post.author?.avatar ? (
              <img src={post.author.avatar} alt={post.author.name} className="w-6 h-6 rounded-full object-cover" loading="lazy" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#FF4D6D] flex items-center justify-center text-white text-xs font-bold">
                {post.author?.name?.[0]?.toUpperCase() ?? 'A'}
              </div>
            )}
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{post.author?.name}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              {formatViews(post.views)}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
              {formatViews(post.likes)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

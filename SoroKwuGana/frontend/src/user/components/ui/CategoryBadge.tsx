interface CategoryBadgeProps {
  category: string;
  slug: string;
  size?: 'sm' | 'md';
}

export default function CategoryBadge({ category, slug, size = 'sm' }: CategoryBadgeProps) {
  const sizeClass = size === 'md' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-xs';
  const colorClass = `cat-${slug.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <span className={`inline-block font-bold uppercase tracking-wider rounded-full ${sizeClass} ${colorClass}`}>
      {category}
    </span>
  );
}

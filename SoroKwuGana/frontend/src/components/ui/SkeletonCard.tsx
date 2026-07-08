export default function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
      <div className="skeleton aspect-[16/10] w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-20 rounded-full" />
        <div className="skeleton h-5 w-full rounded" />
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <div className="skeleton w-6 h-6 rounded-full" />
            <div className="skeleton h-3 w-20 rounded" />
          </div>
          <div className="skeleton h-3 w-16 rounded" />
        </div>
      </div>
    </div>
  );
}

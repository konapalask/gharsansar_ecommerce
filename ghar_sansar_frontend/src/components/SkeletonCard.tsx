import React from "react";

/**
 * SkeletonCard — product card shimmer placeholder.
 * Renders before real products load.
 */
const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden animate-pulse">
    {/* Image placeholder */}
    <div className="aspect-[4/5] skeleton-shimmer bg-gray-100 w-full" />
    {/* Text placeholders */}
    <div className="p-4 space-y-3">
      <div className="h-2.5 skeleton-shimmer rounded-full w-1/3" />
      <div className="h-3 skeleton-shimmer rounded-full w-full" />
      <div className="h-3 skeleton-shimmer rounded-full w-4/5" />
      <div className="flex items-center gap-1 mt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-2.5 h-2.5 skeleton-shimmer rounded-sm" />
        ))}
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="h-5 skeleton-shimmer rounded-full w-20" />
        <div className="w-9 h-9 skeleton-shimmer rounded-full" />
      </div>
    </div>
  </div>
);

/**
 * SkeletonGrid — renders a grid of skeleton cards.
 */
export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default SkeletonCard;

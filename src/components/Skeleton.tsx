export function SkeletonText({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-surface-alt animate-pulse rounded-2xl h-4 ${className}`}
    />
  );
}

export function SkeletonCircle({
  size = "w-12 h-12",
  className = "",
}: {
  size?: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-surface-alt animate-pulse rounded-full ${size} ${className}`}
    />
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-surface rounded-2xl border border-border overflow-hidden ${className}`}
    >
      {/* Image placeholder */}
      <div className="bg-surface-alt animate-pulse h-52 sm:h-56 w-full" />
      {/* Content placeholder */}
      <div className="p-5 sm:p-6 space-y-3">
        <SkeletonText className="h-3 w-20" />
        <SkeletonText className="h-5 w-full" />
        <SkeletonText className="h-5 w-3/4" />
        <SkeletonText className="h-3 w-full" />
        <SkeletonText className="h-3 w-5/6" />
        <div className="flex items-center gap-2 pt-2">
          <SkeletonText className="h-3 w-24" />
          <SkeletonText className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

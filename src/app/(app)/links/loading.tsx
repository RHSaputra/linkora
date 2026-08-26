export default function LinksLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div>
        <div className="h-8 w-40 bg-card/60 rounded-xl" />
        <div className="h-4 w-32 bg-card/40 rounded-lg mt-2" />
      </div>

      {/* Search Bar Skeleton */}
      <div className="h-12 bg-card/60 rounded-xl border border-border/30" />

      {/* Links Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-40 bg-card/40 rounded-xl border border-border/30" />
        ))}
      </div>
    </div>
  );
}

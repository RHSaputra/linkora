export default function CollectionsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-44 bg-card/60 rounded-xl" />
          <div className="h-4 w-56 bg-card/40 rounded-lg mt-2" />
        </div>
        <div className="h-10 w-36 bg-card/60 rounded-xl" />
      </div>

      {/* Collections Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-36 bg-card/40 rounded-2xl border border-border/30 p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-foreground/10" />
              <div className="h-5 bg-foreground/10 rounded w-1/2" />
            </div>
            <div className="h-3 bg-foreground/5 rounded w-3/4" />
            <div className="h-3 bg-foreground/5 rounded w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

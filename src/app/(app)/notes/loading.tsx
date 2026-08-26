export default function NotesLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-primary/10 w-11 h-11" />
            <div className="h-9 w-44 bg-card/60 rounded-xl" />
          </div>
          <div className="h-4 w-72 bg-card/40 rounded-lg mt-2" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-11 w-64 bg-card/60 rounded-xl" />
          <div className="h-11 w-36 bg-primary/20 rounded-xl" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 sm:p-5 rounded-2xl glass-panel bg-card/70 border border-border/60 flex items-center gap-3.5 sm:gap-4">
            <div className="w-11 h-11 rounded-xl bg-foreground/10" />
            <div className="space-y-2 flex-1">
              <div className="h-7 bg-foreground/10 rounded w-12" />
              <div className="h-3 bg-foreground/5 rounded w-20" />
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs Skeleton */}
      <div className="flex items-center gap-2 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 w-28 bg-card/40 rounded-xl" />
        ))}
      </div>

      {/* Notes Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-44 rounded-2xl glass-panel border border-border/30 p-5 space-y-3"
          >
            <div className="h-5 bg-foreground/10 rounded w-2/3" />
            <div className="space-y-2">
              <div className="h-3 bg-foreground/5 rounded w-full" />
              <div className="h-3 bg-foreground/5 rounded w-4/5" />
              <div className="h-3 bg-foreground/5 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

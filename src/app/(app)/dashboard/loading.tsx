export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse pt-8 pb-20">
      {/* Hero Cockpit Skeleton */}
      <div className="h-64 bg-card/60 rounded-[2.5rem] border border-border/40" />

      {/* Stats Grid Skeleton */}
      <div className="h-44 bg-card/60 rounded-3xl border border-border/40" />

      {/* Recent Links Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-60 bg-card/40 rounded-2xl border border-border/30" />
        ))}
      </div>
    </div>
  );
}

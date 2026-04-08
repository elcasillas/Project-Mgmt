export default function AppLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="h-8 w-56 animate-pulse rounded-2xl bg-slate-200" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-36 animate-pulse rounded-3xl bg-white shadow-card" />
        ))}
      </div>
      <div className="h-[360px] animate-pulse rounded-3xl bg-white shadow-card" />
    </div>
  );
}

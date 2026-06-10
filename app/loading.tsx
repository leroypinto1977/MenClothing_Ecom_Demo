export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex min-h-[50vh] items-center justify-center"
    >
      <span className="animate-pulse text-sm font-medium uppercase tracking-[0.34em] text-muted-foreground">
        Meridian
      </span>
    </div>
  );
}

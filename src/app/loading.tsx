export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <div className="space-y-4">
        <div className="h-8 w-44 rounded-md bg-[var(--skeleton)]" />
        <div className="h-28 rounded-md border border-[var(--line)] bg-[var(--panel)]" />
        <div className="h-28 rounded-md border border-[var(--line)] bg-[var(--panel)]" />
        <div className="h-28 rounded-md border border-[var(--line)] bg-[var(--panel)]" />
      </div>
    </main>
  );
}

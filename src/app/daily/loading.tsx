export default function LoadingDaily() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <div className="space-y-4">
        <div className="h-10 w-56 rounded-md bg-[var(--skeleton)]" />
        <div className="h-36 rounded-md border border-[var(--line)] bg-[var(--panel)]" />
        <div className="h-36 rounded-md border border-[var(--line)] bg-[var(--panel)]" />
      </div>
    </main>
  );
}

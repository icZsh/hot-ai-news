type StatusBannerProps = {
  title: string;
  description: string;
  tone?: "info" | "error";
};

export function StatusBanner({
  title,
  description,
  tone = "info",
}: StatusBannerProps) {
  const isError = tone === "error";

  return (
    <div
      className={[
        "rounded-md border px-4 py-3",
        isError
          ? "border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger)]"
          : "border-[var(--line)] bg-[var(--panel)] text-[var(--foreground)]",
      ].join(" ")}
    >
      <div className="text-sm font-semibold">{title}</div>
      <p className="mt-1 text-sm leading-6 text-current opacity-80">
        {description}
      </p>
    </div>
  );
}

export default function Toast({ toasts }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2">
      {toasts.map((t) => (
        <div key={t.id} className={`rounded-full px-4 py-2 font-bold shadow-lg ${t.cls === "combo" ? "bg-gold text-gold-fg" : "bg-ink text-page"}`}>
          {t.text}
        </div>
      ))}
    </div>
  );
}

export default function Loading() {
  return (
    <main className="min-h-dvh bg-paper">
      <div className="border-b border-line">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-2.5 px-4">
          <div className="skeleton h-7 w-7 rounded-lg" />
          <div className="skeleton h-4 w-16" />
        </div>
      </div>
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
        <div className="skeleton h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="skeleton h-24 rounded-2xl" />
          <div className="skeleton h-24 rounded-2xl" />
        </div>
        <div className="space-y-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-[70px] rounded-2xl" />
          ))}
        </div>
      </div>
    </main>
  )
}

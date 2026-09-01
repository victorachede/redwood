export default function Loading() {
  return (
    <main className="min-h-dvh bg-paper">
      {/* Header ghost */}
      <div className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="skeleton h-7 w-7 rounded-md" />
            <div className="skeleton h-4 w-16" />
          </div>
          <div className="flex items-center gap-4">
            <div className="skeleton hidden h-4 w-20 sm:block" />
            <div className="skeleton h-9 w-20 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-8 px-5 py-12 sm:px-8">
        <div className="space-y-3">
          <div className="skeleton h-4 w-28" />
          <div className="skeleton h-10 w-2/3 max-w-sm" />
          <div className="skeleton h-4 w-1/2 max-w-xs" />
        </div>

        <div className="skeleton h-36 w-full rounded-[1.4rem]" />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-52 rounded-2xl" />
          ))}
        </div>
      </div>
    </main>
  )
}

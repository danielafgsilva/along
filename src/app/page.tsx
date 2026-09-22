export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 pb-[env(safe-area-inset-bottom)] text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Along</h1>
      <p className="max-w-xs text-balance text-sm text-zinc-500 dark:text-zinc-400">
        The things you want to live — captured, planned, remembered.
      </p>
    </main>
  );
}

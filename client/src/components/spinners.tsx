export const FullSpinner = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-3">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      <p className="text-sm font-medium text-slate-500">Loading…</p>
    </div>
  </div>
);

export const ButtonSpinner = () => (
  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
);
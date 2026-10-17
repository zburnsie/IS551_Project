/** A round button that marks a chore complete. It fills with a check mark on hover. */
export function CompleteButton({ title, onClick }: { title: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={`Mark “${title}” complete`}
      title="Mark complete"
      className="group flex size-8 shrink-0 items-center justify-center rounded-pill border-2 border-ink-muted bg-surface hover:border-success hover:bg-success"
      onClick={onClick}
    >
      <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 text-success-ink opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 8.5l3 3 7-7" />
      </svg>
    </button>
  )
}

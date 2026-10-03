"use client"; // error.tsx MUST be a Client Component — Next.js requires this
// because it needs to catch errors that happen during client-side rendering
// too, and needs interactivity (the "try again" button).

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="shell">
      <div className="empty-state">
        <p style={{ marginBottom: 12 }}>Something went wrong: {error.message}</p>
        <button className="add-btn" onClick={() => reset()}>
          Try again
        </button>
      </div>
    </main>
  );
}

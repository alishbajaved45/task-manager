export default function Loading() {
  // Next.js automatically wraps page.tsx in a <Suspense> boundary using
  // this file as the fallback. Shown while the Server Component awaits data.
  return (
    <main className="shell">
      <p style={{ color: "#9a9689" }}>Loading tasks…</p>
    </main>
  );
}

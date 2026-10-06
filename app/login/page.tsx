import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/"); // already logged in, no need to see this page

  return (
    <main className="shell auth-shell">
      <header className="app-header">
        <h1>Log in</h1>
        <p>Welcome back your tasks are waiting.</p>
      </header>

      <LoginForm />

      <p className="auth-switch">
        No account yet? <Link href="/register">Register</Link>
      </p>
    </main>
  );
}

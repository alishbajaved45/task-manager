import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import RegisterForm from "@/components/RegisterForm";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <main className="shell auth-shell">
      <header className="app-header">
        <h1>Create an account</h1>
        <p>Your own private task list.</p>
      </header>

      <RegisterForm />

      <p className="auth-switch">
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </main>
  );
}

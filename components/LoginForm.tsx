"use client"; // needs useFormState (React state) -> Client Component

import { useFormState, useFormStatus } from "react-dom";
import { loginUser } from "@/lib/auth-actions";

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="add-btn auth-submit" type="submit" disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}

export default function LoginForm() {
  // useFormState wires a Server Action to component state: it calls
  // loginUser(prevState, formData) on submit and re-renders with whatever
  // the action returns (here: { error: "..." } or nothing on success/redirect).
  const [state, formAction] = useFormState(loginUser, undefined);

  return (
    <form action={formAction} className="auth-form">
      <label className="auth-field">
        <span>Email</span>
        <input name="email" type="email" placeholder="you@example.com" required autoFocus />
      </label>

      <label className="auth-field">
        <span>Password</span>
        <input name="password" type="password" placeholder="••••••••" required minLength={6} />
      </label>

      {state?.error && <p className="form-error">{state.error}</p>}

      <SubmitButton label="Sign in" pendingLabel="Signing in…" />
    </form>
  );
}

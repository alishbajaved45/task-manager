"use client";

import { useFormState, useFormStatus } from "react-dom";
import { registerUser } from "@/lib/auth-actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="add-btn auth-submit" type="submit" disabled={pending}>
      {pending ? "Creating account…" : "Create account"}
    </button>
  );
}

export default function RegisterForm() {
  const [state, formAction] = useFormState(registerUser, undefined);

  return (
    <form action={formAction} className="auth-form">
      <label className="auth-field">
        <span>Name</span>
        <input name="name" type="text" placeholder="Alishba" autoFocus />
      </label>

      <label className="auth-field">
        <span>Email</span>
        <input name="email" type="email" placeholder="you@example.com" required />
      </label>

      <label className="auth-field">
        <span>Password</span>
        <input name="password" type="password" placeholder="At least 6 characters" required minLength={6} />
      </label>

      {state?.error && <p className="form-error">{state.error}</p>}

      <SubmitButton />
    </form>
  );
}

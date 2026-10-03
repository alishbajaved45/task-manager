"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/auth";

type FormState = { error?: string } | undefined;

/**
 * Creates a new account, then signs the person straight in.
 * `prevState` is required by useFormState's calling convention even though
 * we don't read it here.
 */
export async function registerUser(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const name = (formData.get("name") as string)?.trim();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  // Never store the raw password. bcrypt.hash one-way scrambles it; even
  // if the database leaked, the original password can't be recovered.
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { email, password: hashedPassword, name: name || null },
  });

  // Auto sign-in right after registering, then send them to the app.
  // signIn() throws a special redirect internally on success - that's
  // expected and must be allowed to propagate (see catch block below).
  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created, but sign-in failed. Please log in." };
    }
    throw error; // this is the redirect - let it through
  }
}

/** Verifies credentials and starts a session. */
export async function loginUser(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error; // this is the redirect - let it through
  }
}

/** Ends the session. Called directly as a form action, no client JS needed. */
export async function logoutUser() {
  await signOut({ redirectTo: "/login" });
}

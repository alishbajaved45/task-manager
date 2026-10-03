"use server"; // Everything exported from this file runs ONLY on the server.

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

/**
 * Creates a new task, owned by whoever is currently logged in.
 * Called from <form action={createTask}> in a Client Component.
 */
export async function createTask(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("You must be logged in to add a task.");

  const title = (formData.get("title") as string)?.trim();
  const priority = (formData.get("priority") as string) || "normal";
  if (!title) return;

  await prisma.task.create({
    data: { title, priority, userId: session.user.id },
  });

  revalidatePath("/");
}

/** Flips a task's done/not-done state - only if it belongs to the caller. */
export async function toggleTask(id: string, done: boolean) {
  const session = await auth();
  if (!session?.user) throw new Error("You must be logged in.");

  // updateMany + a userId filter means: if this task belongs to someone
  // else, zero rows match and nothing happens - silently and safely.
  await prisma.task.updateMany({
    where: { id, userId: session.user.id },
    data: { done: !done },
  });

  revalidatePath("/");
}

/** Deletes a task - only if it belongs to the caller. */
export async function deleteTask(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("You must be logged in.");

  await prisma.task.deleteMany({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/");
}

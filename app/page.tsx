import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logoutUser } from "@/lib/auth-actions";
import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/TaskList";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="shell">
      <header className="app-header">
        <div className="app-header-row">
          <div>
            <h1>Task Manager</h1>
            <p>Signed in as {session.user.email}</p>
          </div>
          <form action={logoutUser}>
            <button className="logout-btn" type="submit">
              Log out
            </button>
          </form>
        </div>
      </header>

      <TaskForm />
      <TaskList initialTasks={tasks} />
    </main>
  );
}
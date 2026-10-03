"use client"; // needs local state for instant (optimistic) UI updates

import { useEffect, useState, useTransition } from "react";
import { toggleTask, deleteTask } from "@/lib/actions";

type Task = {
  id: string;
  title: string;
  done: boolean;
  priority: string;
};

export default function TaskList({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  function handleToggle(id: string, done: boolean) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !done } : t))
    );
    startTransition(async () => {
      try {
        await toggleTask(id, done);
      } catch {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, done } : t))
        );
      }
    });
  }

  function handleDelete(id: string) {
    const removed = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    startTransition(async () => {
      try {
        await deleteTask(id);
      } catch {
        if (removed) setTasks((prev) => [...prev, removed]);
      }
    });
  }

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <>
      {tasks.length > 0 && (
        <p className="progress-line">
          {doneCount} of {tasks.length} done
        </p>
      )}

      {tasks.length === 0 ? (
        <div className="empty-state">You're all caught up. Add your first task above.</div>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id} className="task-item">
              <button
                className={`check-btn ${task.done ? "done" : ""}`}
                onClick={() => handleToggle(task.id, task.done)}
                aria-label={task.done ? "Mark as not done" : "Mark as done"}
              >
                {task.done && (
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>

              <span className={`priority-dot ${task.priority}`} title={task.priority} />

              <span className={`task-title ${task.done ? "done" : ""}`}>
                {task.title}
              </span>

              <button
                className="delete-btn"
                onClick={() => handleDelete(task.id)}
                aria-label="Delete task"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
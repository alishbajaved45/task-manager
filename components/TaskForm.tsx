"use client"; // <-- This component runs in the browser: it needs state and
// event handlers, so it can't be a Server Component.

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { createTask } from "@/lib/actions";

// A small inner component so we can use useFormStatus, which only works
// inside the <form> it belongs to (it reads the parent form's pending state).
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="add-btn" type="submit" disabled={pending}>
      {pending ? "Adding…" : "Add task"}
    </button>
  );
}

export default function TaskForm() {
  const [title, setTitle] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      className="task-form"
      action={async (formData) => {
        // Optimistic UX: clear the input immediately, don't wait for the
        // server round-trip. The Server Action still does the real write.
        setTitle("");
        await createTask(formData);
        formRef.current?.reset();
      }}
    >
      <div className="field-title">
        <input
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
          autoComplete="off"
          required
        />
      </div>

      <select name="priority" className="priority-select" defaultValue="normal">
        <option value="low">Low</option>
        <option value="normal">Normal</option>
        <option value="high">High</option>
      </select>

      <SubmitButton />
    </form>
  );
}

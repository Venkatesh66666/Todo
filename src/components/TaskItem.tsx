import React from "react"
import type { Task } from "../types"

type Props = {
  task: Task
  onMove: (id: number, status: Task["status"]) => void
  onDelete: (id: number) => void
}

function TaskItem({ task, onMove, onDelete }: Props) {
  return (
    <div
      draggable
      onDragStart={e => {
        e.dataTransfer.setData("text/plain", String(task.id))
      }}
      style={{
        background: "#ffffff",
        padding: "10px",
        borderRadius: "10px",
        marginBottom: "10px",
        boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "8px"
      }}
    >
      <span style={{ fontWeight: 500 }}>{task.title}</span>

      <div style={{ display: "flex", gap: "6px" }}>
        {task.status === "todo" && (
          <button
            style={{ background: "#22c55e", color: "#fff" }}
            onClick={() => onMove(task.id, "inprogress")}
          >
            Start
          </button>
        )}

        {task.status === "inprogress" && (
          <button
            style={{ background: "#0ea5e9", color: "#fff" }}
            onClick={() => onMove(task.id, "completed")}
          >
            Complete
          </button>
        )}

        <button
          style={{ background: "#ef4444", color: "#fff" }}
          onClick={() => onDelete(task.id)}
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default React.memo(TaskItem)

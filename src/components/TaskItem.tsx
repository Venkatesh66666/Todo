import React from "react"
import type { Task } from "../types"

type Props = {
  task: Task
  onMove: (id: number, status: Task["status"]) => void
  onDelete: (id: number) => void
  onDragStart: (id: number, status: Task["status"]) => void
  onDropReorder: (targetId: number) => void
}

function TaskItem({ task, onMove, onDelete, onDragStart, onDropReorder }: Props) {
  return (
    <div
      draggable
      onDragStart={e => {
        e.dataTransfer.setData("text/plain", String(task.id))
        e.dataTransfer.effectAllowed = "move"
        onDragStart(task.id, task.status)
      }}
      onDragOver={e => e.preventDefault()}
      onDrop={e => {
        e.stopPropagation()
        onDropReorder(task.id)
      }}
      style={card}
    >
      <strong>{task.title}</strong>

      <div style={{ display: "flex", gap: 6 }}>
        {task.status === "todo" && (
          <button style={btnStart} onClick={() => onMove(task.id, "inprogress")}>Start</button>
        )}
        {task.status === "inprogress" && (
          <button style={btnDone} onClick={() => onMove(task.id, "completed")}>Complete</button>
        )}
        <button style={btnDel} onClick={() => onDelete(task.id)}>Delete</button>
      </div>
    </div>
  )
}

export default React.memo(TaskItem)

const card: React.CSSProperties = {
  background: "#fff",
  padding: 10,
  borderRadius: 10,
  marginBottom: 10,
  boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 8
}

const btnStart: React.CSSProperties = { background: "#22c55e", color: "#fff" }
const btnDone: React.CSSProperties = { background: "#0ea5e9", color: "#fff" }
const btnDel: React.CSSProperties = { background: "#ef4444", color: "#fff" }
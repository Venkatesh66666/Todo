import React from "react"
import { Button } from "./ui/button"
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
      className="mb-2 flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
    >
      
      <strong className="break-words text-sm text-slate-900">{task.title}</strong>
      <div className="flex shrink-0 gap-1">
        {task.status === "todo" && (
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => onMove(task.id, "inprogress")}>
            Start
          </Button>
        )}
        {task.status === "inprogress" && (
          <Button size="sm" className="bg-sky-600 hover:bg-sky-700" onClick={() => onMove(task.id, "completed")}>
            Complete
          </Button>
        )}
        <Button size="sm" variant="destructive" onClick={() => onDelete(task.id)}>
          Delete
        </Button>
      </div>
    </div>
  )
}

export default React.memo(TaskItem)

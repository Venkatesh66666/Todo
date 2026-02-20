import { useState, useMemo, useCallback } from "react"
import type { Task, TaskStatus } from "./types"
import TaskItem from "./components/TaskItem"

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState("")

  const addTask = useCallback(() => {
    if (!title.trim()) return
    setTasks(prev => [...prev, { id: Date.now(), title, status: "todo" }])
    setTitle("")
  }, [title])

  const moveTask = useCallback((id: number, status: TaskStatus) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, status } : t)))
  }, [])

  const deleteTask = useCallback((id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }, [])

  const onDropTo = useCallback((status: TaskStatus, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const id = Number(e.dataTransfer.getData("text/plain"))
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, status } : t)))
  }, [])

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const todoTasks = useMemo(() => tasks.filter(t => t.status === "todo"), [tasks])
  const inProgressTasks = useMemo(() => tasks.filter(t => t.status === "inprogress"), [tasks])
  const completedTasks = useMemo(() => tasks.filter(t => t.status === "completed"), [tasks])

  return (
    <div style={{ padding: "24px", maxWidth: "1100px", margin: "auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>📝 ToDo Board</h1>

      <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "20px" }}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter new task..."
          style={{ width: "260px" }}
        />
        <button onClick={addTask}>Add Task</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        <div style={columnStyle} onDrop={e => onDropTo("todo", e)} onDragOver={onDragOver}>
          <h3>🆕 New Task</h3>
          {todoTasks.map(task => (
            <TaskItem key={task.id} task={task} onMove={moveTask} onDelete={deleteTask} />
          ))}
        </div>

        <div style={columnStyle} onDrop={e => onDropTo("inprogress", e)} onDragOver={onDragOver}>
          <h3>🔄 In Progress</h3>
          {inProgressTasks.map(task => (
            <TaskItem key={task.id} task={task} onMove={moveTask} onDelete={deleteTask} />
          ))}
        </div>

        <div style={columnStyle} onDrop={e => onDropTo("completed", e)} onDragOver={onDragOver}>
          <h3>✅ Completed</h3>
          {completedTasks.map(task => (
            <TaskItem key={task.id} task={task} onMove={moveTask} onDelete={deleteTask} />
          ))}
        </div>
      </div>
    </div>
  )
}

const columnStyle: React.CSSProperties = {
  background: "#ffffffcc",
  backdropFilter: "blur(6px)",
  padding: "14px",
  borderRadius: "14px",
  minHeight: "300px",
  boxShadow: "0 10px 20px rgba(0,0,0,0.08)"
}

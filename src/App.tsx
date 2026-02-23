import { useState, useMemo, useCallback, useEffect } from "react"
import type { Task, TaskStatus } from "./types"
import TaskItem from "./components/TaskItem"

const STORAGE_KEY = "todo_tasks_v1"

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks())
  const [title, setTitle] = useState("")
  const [query, setQuery] = useState("")

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

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

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tasks
    return tasks.filter(t => t.title.toLowerCase().includes(q))
  }, [tasks, query])

  const todoTasks = useMemo(() => filteredTasks.filter(t => t.status === "todo"), [filteredTasks])
  const inProgressTasks = useMemo(() => filteredTasks.filter(t => t.status === "inprogress"), [filteredTasks])
  const completedTasks = useMemo(() => filteredTasks.filter(t => t.status === "completed"), [filteredTasks])

  return (
    <div style={{ padding: "24px", maxWidth: "1100px", margin: "auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "12px" }}>📝 ToDo Board</h1>

      <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "12px" }}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter new task..."
          style={{ width: "260px" }}
        />
        <button onClick={addTask}>Add Task</button>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search tasks..."
          style={{ width: "350px" }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        <div style={columnStyle} onDrop={e => onDropTo("todo", e)} onDragOver={onDragOver}>
          <h3>🆕 New Task</h3>
          {todoTasks.length === 0 ? (
            <EmptyState text={query ? "No matching tasks" : "No tasks here. Add one "} />
          ) : (
            todoTasks.map(task => (
              <TaskItem key={task.id} task={task} onMove={moveTask} onDelete={deleteTask} />
            ))
          )}
        </div>

        <div style={columnStyle} onDrop={e => onDropTo("inprogress", e)} onDragOver={onDragOver}>
          <h3>🔄 In Progress</h3>
          {inProgressTasks.length === 0 ? (
            <EmptyState text={query ? "No matching tasks" : "Drag a task here to start "} />
          ) : (
            inProgressTasks.map(task => (
              <TaskItem key={task.id} task={task} onMove={moveTask} onDelete={deleteTask} />
            ))
          )}
        </div>

        <div style={columnStyle} onDrop={e => onDropTo("completed", e)} onDragOver={onDragOver}>
          <h3>✅ Completed</h3>
          {completedTasks.length === 0 ? (
            <EmptyState text={query ? "No matching tasks" : "Finish tasks to see them here "} />
          ) : (
            completedTasks.map(task => (
              <TaskItem key={task.id} task={task} onMove={moveTask} onDelete={deleteTask} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div
      style={{
        padding: "12px",
        borderRadius: "10px",
        background: "#f1f5f9",
        color: "#475569",
        textAlign: "center",
        marginTop: "8px"
      }}
    >
      {text}
    </div>
  )
}

const columnStyle: React.CSSProperties = {
  background: "#ffffffcc",
  backdropFilter: "blur(6px)",
  padding: "14px",
  borderRadius: "14px",
  minHeight: "320px",
  boxShadow: "0 10px 20px rgba(0,0,0,0.08)"
}
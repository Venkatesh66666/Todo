import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import type { Task, TaskStatus } from "./types"
import TaskItem from "./components/TaskItem"

const STORAGE_KEY = "todo_tasks_clean"

const loadTasks = (): Task[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks)
  const [title, setTitle] = useState("")
  const [query, setQuery] = useState("")
  const dragId = useRef<number | null>(null)
  const dragStatus = useRef<TaskStatus | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const addTask = useCallback(() => {
    const t = title.trim()
    if (!t) return
    setTasks(p => [...p, { id: Date.now(), title: t, status: "todo" }])
    setTitle("")
  }, [title])

  const moveTask = useCallback((id: number, status: TaskStatus) => {
    setTasks(p => p.map(t => (t.id === id ? { ...t, status } : t)))
  }, [])

  const deleteTask = useCallback((id: number) => {
    setTasks(p => p.filter(t => t.id !== id))
  }, [])

  const onDragStart = useCallback((id: number, status: TaskStatus) => {
    dragId.current = id
    dragStatus.current = status
  }, [])

  const onDropOnColumn = useCallback((status: TaskStatus, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const id = dragId.current
    if (!id) return
    setTasks(p => p.map(t => (t.id === id ? { ...t, status } : t)))
    dragId.current = null
    dragStatus.current = null
  }, [])

  const onDropReorder = useCallback((targetId: number) => {
    const sourceId = dragId.current
    const sourceStatus = dragStatus.current
    if (!sourceId || !sourceStatus || sourceId === targetId) return

    setTasks(p => {
      const source = p.find(t => t.id === sourceId)
      const target = p.find(t => t.id === targetId)
      if (!source || !target) return p

      if (source.status !== target.status) {
        return p.map(t => (t.id === sourceId ? { ...t, status: target.status} : t))
      }

      const same = p.filter(t => t.status === source.status)
      const rest = p.filter(t => t.status !== source.status)

      const si = same.findIndex(t => t.id === sourceId)
      const ti = same.findIndex(t => t.id === targetId)

      const arr = [...same]
      const [moved] = arr.splice(si, 1)
      arr.splice(ti, 0, moved)

      return [...rest, ...arr]
    })

    dragId.current = null
    dragStatus.current = null
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? tasks.filter(t => t.title.toLowerCase().includes(q)) : tasks
  }, [tasks, query])

  const todo = useMemo(() => filtered.filter(t => t.status === "todo"), [filtered])
  const prog = useMemo(() => filtered.filter(t => t.status === "inprogress"), [filtered])
  const done = useMemo(() => filtered.filter(t => t.status === "completed"), [filtered])

  const noResults = query.trim() && filtered.length === 0

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: 12 }}>📝 ToDo Board</h1>

      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 12 }}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter new task..." style={{ width: 240 }} />
        <button onClick={addTask}>Add</button>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search tasks..." style={{ width: 300 }} />
      </div>

      {noResults && (
        <div style={{ textAlign: "center", marginBottom: 12, padding: 10, background: "#fee2e2", color: "#991b1b", borderRadius: 8 }}>
          No tasks found for “{query}”
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <div style={column} onDrop={e => onDropOnColumn("todo", e)} onDragOver={e => e.preventDefault()}>
          <h3>🆕 New Task</h3>
          {todo.map(t => (
            <TaskItem key={t.id} task={t} onMove={moveTask} onDelete={deleteTask} onDragStart={onDragStart} onDropReorder={onDropReorder} />
          ))}
          {!todo.length && !noResults && <Empty text="No tasks here" />}
        </div>

        <div style={column} onDrop={e => onDropOnColumn("inprogress", e)} onDragOver={e => e.preventDefault()}>
          <h3>🔄 In Progress</h3>
          {prog.map(t => (
            <TaskItem key={t.id} task={t} onMove={moveTask} onDelete={deleteTask} onDragStart={onDragStart} onDropReorder={onDropReorder} />
          ))}
          {!prog.length && !noResults && <Empty text="Drag a task here" />}
        </div>

        <div style={column} onDrop={e => onDropOnColumn("completed", e)} onDragOver={e => e.preventDefault()}>
          <h3>✅ Completed</h3>
          {done.map(t => (
            <TaskItem key={t.id} task={t} onMove={moveTask} onDelete={deleteTask} onDragStart={onDragStart} onDropReorder={onDropReorder} />
          ))}
          {!done.length && !noResults && <Empty text="Finish tasks to see them here" />}
        </div>
      </div>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <div style={{ padding: 10, background: "#f1f5f9", borderRadius: 8, textAlign: "center" }}>{text}</div>
}

const column: React.CSSProperties = {
  background: "#ffffffcc",
  backdropFilter: "blur(6px)",
  padding: 14,
  borderRadius: 14,
  minHeight: 320,
  boxShadow: "0 10px 20px rgba(0,0,0,0.08)"
}
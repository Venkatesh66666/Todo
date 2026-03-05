import { useMemo, useRef, useState } from "react"
import TaskItem from "./components/TaskItem"
import { Button } from "./components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog"
import { Input } from "./components/ui/input"
import { useTaskStore } from "./store/useTaskStore"
import type { TaskStatus } from "./types"

export default function App() {
  const tasks = useTaskStore(state => state.tasks)
  const addTask = useTaskStore(state => state.addTask)
  const moveTask = useTaskStore(state => state.moveTask)
  const deleteTask = useTaskStore(state => state.deleteTask)
  const reorderOrMoveTask = useTaskStore(state => state.reorderOrMoveTask)



  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [query, setQuery] = useState("")
  const dragId = useRef<number | null>(null)
  const dragStatus = useRef<TaskStatus | null>(null)

  const onCreateTask = () => {
    const next = title.trim()
    if (!next) return
    addTask(next)
    setTitle("")
    setOpen(false)
  }


  const onDragStart = (id: number, status: TaskStatus) => {
    dragId.current = id
    dragStatus.current = status
  }

  const onDropOnColumn = (status: TaskStatus, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const id = dragId.current
    if (!id) return
    moveTask(id, status)
    dragId.current = null
    dragStatus.current = null

  }

  const onDropReorder = (targetId: number) => {
    const sourceId = dragId.current
    if (!sourceId || sourceId === targetId) return
    reorderOrMoveTask(sourceId, targetId)
    dragId.current = null
    dragStatus.current = null
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? tasks.filter(t => t.title.toLowerCase().includes(q)) : tasks
  }, [tasks, query])

  const todo = useMemo(() => filtered.filter(t => t.status === "todo"), [filtered])
  const prog = useMemo(() => filtered.filter(t => t.status === "inprogress"), [filtered])
  const done = useMemo(() => filtered.filter(t => t.status === "completed"), [filtered])
  const noResults = query.trim() && filtered.length === 0

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl p-6 md:p-10">
      <h1 className="mb-6 text-center text-3xl font-bold tracking-tight text-slate-900">ToDo Board</h1>

      <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
              <DialogDescription>Add a new task to your board.</DialogDescription>
            </DialogHeader>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter new task..."
              onKeyDown={e => {
                if (e.key === "Enter") onCreateTask()
              }}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={onCreateTask}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search tasks..."
          className="w-full max-w-xs"
        />
      </div>

      {noResults && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-700">
          No tasks found for "{query}"
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className={columnClass} onDrop={e => onDropOnColumn("todo", e)} onDragOver={e => e.preventDefault()}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">New Task</h3>
          {todo.map(task => (
            <TaskItem key={task.id} task={task} onMove={moveTask} onDelete={deleteTask} onDragStart={onDragStart} onDropReorder={onDropReorder} />
          ))}
          {!todo.length && !noResults && <Empty text="No tasks here" />}
        </div>


        <div className={columnClass} onDrop={e => onDropOnColumn("inprogress", e)} onDragOver={e => e.preventDefault()}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">In Progress</h3>
          {prog.map(task => (
            <TaskItem key={task.id} task={task} onMove={moveTask} onDelete={deleteTask} onDragStart={onDragStart} onDropReorder={onDropReorder} />
          ))}
          {!prog.length && !noResults && <Empty text="Drag a task here" />}
        </div>


        <div className={columnClass} onDrop={e => onDropOnColumn("completed", e)} onDragOver={e => e.preventDefault()}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">Completed</h3>
          {done.map(task => (
            <TaskItem key={task.id} task={task} onMove={moveTask} onDelete={deleteTask} onDragStart={onDragStart} onDropReorder={onDropReorder} />
          ))}
          {!done.length && !noResults && <Empty text="Finish tasks to see them here" />}
          
        </div>
      </div>
    </main>
  )
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-center text-sm text-slate-500">{text}</div>
}

const columnClass = "min-h-[320px] rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm backdrop-blur"

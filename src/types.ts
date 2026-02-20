export type TaskStatus = "todo" | "inprogress" | "completed"

export type Task = {
  id: number
  title: string
  status: TaskStatus
}

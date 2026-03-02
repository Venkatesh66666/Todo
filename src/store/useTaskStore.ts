import { create } from "zustand"
import type { Task, TaskStatus } from "../types"

type TaskStore = {
  tasks: Task[]
  addTask: (title: string) => void
  moveTask: (id: number, status: TaskStatus) => void
  deleteTask: (id: number) => void
  reorderOrMoveTask: (sourceId: number, targetId: number) => void
}

export const useTaskStore = create<TaskStore>(set => ({
  tasks: [],
  addTask: title =>
    set(state => ({
      tasks: [...state.tasks, { id: Date.now() + Math.floor(Math.random() * 1000), title, status: "todo" }]
    })),
  moveTask: (id, status) =>
    set(state => ({
      tasks: state.tasks.map(task => (task.id === id ? { ...task, status } : task))
    })),
  deleteTask: id =>
    set(state => ({
      tasks: state.tasks.filter(task => task.id !== id)
    })),
  reorderOrMoveTask: (sourceId, targetId) =>
    set(state => {
      const source = state.tasks.find(task => task.id === sourceId)
      const target = state.tasks.find(task => task.id === targetId)
      if (!source || !target) return state

      if (source.status !== target.status) {
        return {
          tasks: state.tasks.map(task => (task.id === sourceId ? { ...task, status: target.status } : task))
        }
      }


      
      const sameColumn = state.tasks.filter(task => task.status === source.status)
      const otherColumns = state.tasks.filter(task => task.status !== source.status)
      const sourceIndex = sameColumn.findIndex(task => task.id === sourceId)
      const targetIndex = sameColumn.findIndex(task => task.id === targetId)

      if (sourceIndex < 0 || targetIndex < 0) return state

      const reordered = [...sameColumn]
      const [moved] = reordered.splice(sourceIndex, 1)
      reordered.splice(targetIndex, 0, moved)

      return { tasks: [...otherColumns, ...reordered] }
    })
}))

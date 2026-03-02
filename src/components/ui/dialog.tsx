import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "../../lib/utils"

type DialogContextValue = {
  open: boolean
  onOpenChange: (open: boolean) => void
}



const DialogContext = React.createContext<DialogContextValue | null>(null)

function useDialogContext() {
  const context = React.useContext(DialogContext)
  if (!context) {
    throw new Error("Dialog components must be used inside Dialog.")
  }
  return context
}

type DialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
  return <DialogContext.Provider value={{ open, onOpenChange }}>{children}</DialogContext.Provider>
}


type TriggerOrCloseProps = {
  asChild?: boolean
  children: React.ReactElement<{ onClick?: React.MouseEventHandler<HTMLElement> }>
}

function DialogTrigger({ asChild, children }: TriggerOrCloseProps) {
  const { onOpenChange } = useDialogContext()
  const onClick = () => onOpenChange(true)

  if (asChild) {
    const existingOnClick = children.props.onClick
    return React.cloneElement(children, {
      onClick: e => {
        existingOnClick?.(e)
        onClick()
      }
    })
  }

  return <button onClick={onClick}>{children}</button>
}

function DialogClose({ asChild, children }: TriggerOrCloseProps) {
  const { onOpenChange } = useDialogContext()
  const onClick = () => onOpenChange(false)

  if (asChild) {
    const existingOnClick = children.props.onClick
    return React.cloneElement(children, {
      onClick: e => {
        existingOnClick?.(e)
        onClick()
      }
    })
  }

  return <button onClick={onClick}>{children}</button>
}


type DialogContentProps = {
  className?: string
  children: React.ReactNode
}

function DialogContent({ className, children }: DialogContentProps) {
  const { open, onOpenChange } = useDialogContext()
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" onMouseDown={() => onOpenChange(false)}>
      <div
        className={cn("w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-lg", className)}
        onMouseDown={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-3 space-y-1", className)} {...props} />
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-4 flex justify-end gap-2", className)} {...props} />
}

function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold text-slate-900", className)} {...props} />
}


function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-slate-500", className)} {...props} />
}

export { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger }

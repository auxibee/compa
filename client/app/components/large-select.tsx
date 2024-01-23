import React from "react"
import { Modal } from "./modal"
import { FieldValues, FormProvider, set, useForm } from "react-hook-form"
import { RequestState } from "~/lib/request-state"
import clsx from "clsx"

interface Props extends React.PropsWithChildren {
  options: { label: string; value: string }[]
  newForm: React.ReactNode
  onAdd: (data: FieldValues) => Promise<void>
  onSelect: (value: string) => void
  open: boolean
  onToggle: (open: boolean) => void
}

function LargeSelect({
  children,
  newForm,
  onAdd,
  onSelect,
  open,
  onToggle,
  options,
}: Props) {
  const [state, setState] = React.useState<"select" | "add">("select")

  function showAdd() {
    setState("add")
  }

  function hide() {
    onToggle(false)
  }

  async function handleOnAdd(data: FieldValues) {
    await onAdd(data)
    setState("select")
  }

  React.useEffect(() => {
    if (!open) {
      setState("select")
    }
  }, [open])

  return (
    <>
      <button
        className="bg-zinc-200 dark:bg-neutral-800 px-2 py-1 rounded-lg font-medium flex-1 text-start flex items-center w-full"
        type="button"
        onClick={() => onToggle(true)}
      >
        <span className="flex-1 line-clamp-1">{children}</span>
        <div className="i-lucide-mouse-pointer-2 text-secondary"></div>
      </button>

      <Modal onClose={() => onToggle(false)} show={open}>
        <div className="w-[24rem] rounded-lg bg-zinc-100 dark:bg-neutral-900 dark:border border-neutral-800 h-[24rem] flex flex-col">
          {state === "select" ? (
            <SelectState
              onShowAdd={showAdd}
              onHide={hide}
              onSelect={onSelect}
              options={options}
            />
          ) : (
            <FormState
              form={newForm}
              onAdd={handleOnAdd}
              onCancel={() => setState("select")}
            />
          )}
        </div>
      </Modal>
    </>
  )
}

interface SelectProps {
  onShowAdd: VoidFunction
  onHide: VoidFunction
  options: Props["options"]
  onSelect: Props["onSelect"]
}

function SelectState({ onShowAdd, onHide, onSelect, options }: SelectProps) {
  return (
    <>
      <header className="p-2">
        <div className="text-sm text-secondary flex gap-2 items-center mb-2 font-medium">
          <div className="i-lucide-scan-search"></div> Select Programme
        </div>
        <div>
          <input
            className="block w-full px-2 py-1 bg-zinc-200 dark:bg-neutral-800 rounded-md placeholder:text-zinc-400 dark:placeholder:text-neutral-500"
            type="text"
            placeholder="Start typing…"
          />
        </div>
      </header>

      <ul className="flex-1 mx-2 overflow-y-auto">
        {options.length === 0 && (
          <li className="text-secondary">
            No options available. Try adding new.
          </li>
        )}

        {options.map((option) => (
          <li
            className="px-2 py-1 hover:bg-zinc-200 dark:hover:bg-neutral-800 rounded-lg focus-within:bg-zinc-200 dark:focus-within:bg-neutral-800"
            key={option.value}
            onClick={() => onSelect(option.value)}
          >
            <button className="block w-full text-start">{option.label}</button>
          </li>
        ))}
      </ul>

      <footer className="border-t border-zinc-200 dark:border-neutral-800 flex justify-between p-2">
        <button
          className="inline-flex gap-2 items-center bg-zinc-200 dark:bg-neutral-800 px-2 rounded-md font-medium"
          onClick={onShowAdd}
        >
          <div className="i-lucide-list-plus text-secondary" /> Add new
        </button>

        <button
          className="px-2 py-1 hover:bg-zinc-200 dark:hover:bg-neutral-800 rounded-lg font-medium"
          onClick={onHide}
        >
          Cancel
        </button>
      </footer>
    </>
  )
}

interface FormStateProps {
  form: Props["newForm"]
  onAdd: Props["onAdd"]
  onCancel: VoidFunction
}

function FormState({ form, onAdd, onCancel }: FormStateProps) {
  const formMethods = useForm()
  const { handleSubmit } = formMethods
  const [status, setStatus] = React.useState<RequestState>("idle")

  async function submit(data: FieldValues) {
    setStatus("loading")
    try {
      await onAdd(data)
      setStatus("success")
    } catch (error) {
      setStatus("error")
    }
  }

  return (
    <FormProvider {...formMethods}>
      <form className="flex flex-col h-full" onSubmit={handleSubmit(submit)}>
        <div className="flex-1">{form}</div>

        <footer className="border-t border-zinc-200 dark:border-neutral-800 flex justify-between p-2">
          <button
            className="px-2 py-1 hover:bg-zinc-200 dark:hover:bg-neutral-800 rounded-lg font-medium"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>

          <button className="inline-flex gap-2 items-center bg-zinc-200 dark:bg-neutral-800 px-2 rounded-md font-medium">
            <div
              className={clsx("text-secondary", {
                "i-lucide-corner-down-left": status !== "loading",
                "i-svg-spinners-dot-revolve": status === "loading",
              })}
            />{" "}
            {status === "loading" ? "Saving…" : "Save"}
          </button>
        </footer>
      </form>
    </FormProvider>
  )
}

export { LargeSelect }
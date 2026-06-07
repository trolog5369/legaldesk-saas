import * as React from "react"
import { ChevronDown, Check } from "lucide-react"

const SelectContext = React.createContext(null)

export function Select({ value, onValueChange, children }) {
  const [open, setOpen] = React.useState(false)
  const [selectedLabel, setSelectedLabel] = React.useState("")
  const containerRef = React.useRef(null)

  React.useEffect(() => {
    function handleOutsideClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, selectedLabel, setSelectedLabel }}>
      <div ref={containerRef} className="relative w-full">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({ children, className = "" }) {
  const { open, setOpen } = React.useContext(SelectContext)
  return (
    <div
      onClick={() => setOpen(!open)}
      className={`flex h-10 w-full items-center justify-between rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm cursor-pointer select-none focus:outline-none focus:border-[#3B82F6] transition-colors ${className}`}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
    </div>
  )
}

export function SelectValue({ placeholder }) {
  const { value, selectedLabel } = React.useContext(SelectContext)
  return (
    <span className={!value ? "text-[#94A3B8]" : "text-[#0F172A]"}>
      {value ? selectedLabel : placeholder}
    </span>
  )
}

export function SelectContent({ children, className = "" }) {
  const { open } = React.useContext(SelectContext)
  if (!open) return null
  return (
    <div
      className={`absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-lg border border-[#E2E8F0] bg-white p-1 shadow-md ${className}`}
    >
      {children}
    </div>
  )
}

export function SelectItem({ value, children, className = "" }) {
  const { value: selectedValue, onValueChange, setOpen, setSelectedLabel } = React.useContext(SelectContext)
  const isSelected = selectedValue === value

  React.useEffect(() => {
    if (isSelected) {
      let text = ""
      if (typeof children === "string") {
        text = children
      } else {
        text = React.Children.toArray(children)
          .map(c => {
            if (typeof c === "object") {
              return c.props?.children || ""
            }
            return c
          })
          .join(" ")
      }
      setSelectedLabel(text)
    }
  }, [isSelected, children, setSelectedLabel])

  const handleSelect = (e) => {
    e.stopPropagation()
    onValueChange(value)
    setOpen(false)
  }

  return (
    <div
      onClick={handleSelect}
      className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm cursor-pointer select-none hover:bg-[#F1F5F9] transition-colors ${
        isSelected ? "bg-[#EFF6FF] text-[#1D4ED8]" : "text-[#0F172A]"
      } ${className}`}
    >
      <div className="flex-1 text-left">{children}</div>
      {isSelected && <Check className="h-4 w-4 text-[#1D4ED8] flex-shrink-0 ml-2" />}
    </div>
  )
}

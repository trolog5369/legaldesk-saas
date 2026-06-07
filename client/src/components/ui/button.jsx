import * as React from "react"

export function Button({ className = "", children, disabled, type = "button", ...props }) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 bg-[#1D4ED8] text-white hover:bg-blue-700 shadow-sm active:scale-[0.98] h-10 px-4 py-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

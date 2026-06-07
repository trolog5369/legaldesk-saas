import * as React from "react"

export function Badge({ className = "", variant = "default", children, ...props }) {
  const baseStyle = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none"
  const variants = {
    default: "bg-[#1D4ED8] text-white shadow hover:bg-blue-700",
    secondary: "bg-[#F1F5F9] text-[#0F172A] hover:bg-[#E2E8F0]",
    destructive: "bg-[#EF4444] text-white shadow hover:bg-red-600",
    outline: "text-[#64748B] border border-[#E2E8F0] bg-white",
  }
  const variantStyle = variants[variant] || variants.default
  return (
    <span className={`${baseStyle} ${variantStyle} ${className}`} {...props}>
      {children}
    </span>
  )
}

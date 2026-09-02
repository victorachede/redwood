'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

type Props = {
  id?: string
  label?: string
  value: string
  onChange: (value: string) => void
  autoComplete?: string
  required?: boolean
  minLength?: number
  placeholder?: string
  name?: string
}

export function PasswordField({
  id = 'password',
  label = 'Password',
  value,
  onChange,
  autoComplete = 'current-password',
  required = true,
  minLength,
  placeholder,
  name = 'password',
}: Props) {
  const [show, setShow] = useState(false)

  // The label is a sibling with htmlFor rather than a wrapper: nesting the
  // toggle button inside <label> made clicking it also target the input.
  return (
    <div className="block">
      <label
        htmlFor={id}
        className="text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-muted"
      >
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          id={id}
          name={name}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          minLength={minLength}
          placeholder={placeholder}
          className="w-full rounded-xl border border-line bg-surface px-3.5 py-3 pr-11 text-[14.5px] outline-none transition-shadow focus:border-streak focus:shadow-[0_0_0_4px_rgba(201,168,76,0.15)]"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-muted transition-all duration-200 hover:bg-sunken hover:text-ink active:scale-90"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

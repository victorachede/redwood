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

  return (
    <label className="block">
      <span className="text-xs font-medium text-ink-muted">{label}</span>
      <div className="relative mt-1">
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
          className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 pr-11 text-sm outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-muted hover:bg-accent-soft hover:text-ink"
          aria-label={show ? 'Hide password' : 'Show password'}
          tabIndex={0}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  )
}

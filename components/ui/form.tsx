'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#5C3A1F] mb-2">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full h-11 px-4 rounded-lg border border-[#E5E5E5] bg-white text-[#5C3A1F]',
          'focus:outline-none focus:ring-2 focus:ring-[#D2A04A] focus:border-transparent',
          'placeholder:text-[#A0A0A0]',
          error && 'border-[#CE1126]',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-[#CE1126]">{error}</p>
      )}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#5C3A1F] mb-2">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'w-full min-h-[120px] px-4 py-3 rounded-lg border border-[#E5E5E5] bg-white text-[#5C3A1F]',
          'focus:outline-none focus:ring-2 focus:ring-[#D2A04A] focus:border-transparent',
          'placeholder:text-[#A0A0A0]',
          error && 'border-[#CE1126]',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-[#CE1126]">{error}</p>
      )}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export function Select({ label, error, options, className, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#5C3A1F] mb-2">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full h-11 px-4 rounded-lg border border-[#E5E5E5] bg-white text-[#5C3A1F]',
          'focus:outline-none focus:ring-2 focus:ring-[#D2A04A] focus:border-transparent',
          error && 'border-[#CE1126]',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-[#CE1126]">{error}</p>
      )}
    </div>
  )
}

'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-[#5C3A1F] text-white hover:bg-[#4a2e18] focus:ring-[#5C3A1F]',
        secondary: 'bg-[#D2A04A] text-white hover:bg-[#c19340] focus:ring-[#D2A04A]',
        outline: 'border-2 border-[#5C3A1F] text-[#5C3A1F] hover:bg-[#5C3A1F] hover:text-white',
        ghost: 'hover:bg-[#FDFBF7] text-[#5C3A1F]',
        danger: 'bg-[#CE1126] text-white hover:bg-[#b50f20] focus:ring-[#CE1126]',
        success: 'bg-[#00732F] text-white hover:bg-[#005c26] focus:ring-[#00732F]',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode
}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

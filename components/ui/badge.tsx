'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-[#5C3A1F] text-white hover:bg-[#4a2e18]',
        secondary: 'bg-[#D2A04A] text-white hover:bg-[#c19340]',
        destructive: 'bg-[#CE1126] text-white hover:bg-[#b50f20]',
        success: 'bg-[#00732F] text-white hover:bg-[#005c26]',
        warning: 'bg-yellow-500 text-white hover:bg-yellow-600',
        outline: 'border border-[#5C3A1F] text-[#5C3A1F] hover:bg-[#5C3A1F] hover:text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}
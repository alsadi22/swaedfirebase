'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { X, Check, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export interface Toast {
  id: string
  title?: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearAllToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    }

    setToasts(prev => [...prev, newToast])

    // Auto remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAllToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const handleRemove = () => {
    setIsLeaving(true)
    setTimeout(() => onRemove(toast.id), 300)
  }

  const getToastStyles = () => {
    const baseStyles = "relative flex items-start p-4 rounded-lg shadow-lg border transition-all duration-300 ease-in-out transform"
    const visibilityStyles = isVisible && !isLeaving 
      ? "translate-x-0 opacity-100" 
      : "translate-x-full opacity-0"

    switch (toast.type) {
      case 'success':
        return `${baseStyles} ${visibilityStyles} bg-green-50 border-green-200 text-green-800`
      case 'error':
        return `${baseStyles} ${visibilityStyles} bg-red-50 border-red-200 text-red-800`
      case 'warning':
        return `${baseStyles} ${visibilityStyles} bg-yellow-50 border-yellow-200 text-yellow-800`
      case 'info':
        return `${baseStyles} ${visibilityStyles} bg-blue-50 border-blue-200 text-blue-800`
      default:
        return `${baseStyles} ${visibilityStyles} bg-white border-[#E5E5E5] text-[#5C3A1F]`
    }
  }

  const getIcon = () => {
    const iconClass = "w-5 h-5 flex-shrink-0 mt-0.5"
    switch (toast.type) {
      case 'success':
        return <Check className={`${iconClass} text-green-600`} />
      case 'error':
        return <AlertCircle className={`${iconClass} text-red-600`} />
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-yellow-600`} />
      case 'info':
        return <Info className={`${iconClass} text-blue-600`} />
      default:
        return <Info className={`${iconClass} text-[#5C3A1F]`} />
    }
  }

  return (
    <div className={getToastStyles()}>
      <div className="flex items-start space-x-3 flex-1">
        {getIcon()}
        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className="font-semibold text-sm mb-1">{toast.title}</p>
          )}
          <p className="text-sm leading-relaxed">{toast.message}</p>
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-sm font-medium underline hover:no-underline transition-all"
            >
              {toast.action.label}
            </button>
          )}
        </div>
      </div>
      <button
        onClick={handleRemove}
        className="ml-3 flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// Convenience hooks for different toast types
export function useSuccessToast() {
  const { addToast } = useToast()
  return useCallback((message: string, title?: string, options?: Partial<Toast>) => {
    addToast({ ...options, type: 'success', message, title })
  }, [addToast])
}

export function useErrorToast() {
  const { addToast } = useToast()
  return useCallback((message: string, title?: string, options?: Partial<Toast>) => {
    addToast({ ...options, type: 'error', message, title })
  }, [addToast])
}

export function useWarningToast() {
  const { addToast } = useToast()
  return useCallback((message: string, title?: string, options?: Partial<Toast>) => {
    addToast({ ...options, type: 'warning', message, title })
  }, [addToast])
}

export function useInfoToast() {
  const { addToast } = useToast()
  return useCallback((message: string, title?: string, options?: Partial<Toast>) => {
    addToast({ ...options, type: 'info', message, title })
  }, [addToast])
}
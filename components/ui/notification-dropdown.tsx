'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  priority: 'low' | 'medium' | 'high'
  status: 'unread' | 'read'
  created_at: string
  data?: any
}

interface NotificationDropdownProps {
  userId?: string
}

export function NotificationDropdown({ userId }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (userId) {
      fetchNotifications()
    }
  }, [userId])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchNotifications = async () => {
    if (!userId) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.notifications?.filter((n: Notification) => n.status === 'unread').length || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId, action: 'mark_read' }),
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, status: 'read' as const } : n
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'mark_all_read' }),
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, status: 'read' as const }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      })

      if (response.ok) {
        const deletedNotification = notifications.find(n => n.id === notificationId)
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        if (deletedNotification?.status === 'unread') {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    const iconClass = "w-4 h-4"
    switch (type) {
      case 'success':
        return <Check className={`${iconClass} text-green-600`} />
      case 'warning':
        return <Bell className={`${iconClass} text-yellow-600`} />
      case 'error':
        return <X className={`${iconClass} text-red-600`} />
      default:
        return <Bell className={`${iconClass} text-blue-600`} />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (!userId) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#5C3A1F] hover:text-[#D2A04A] transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#CE1126] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-[#E5E5E5] z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between">
            <h3 className="font-semibold text-[#5C3A1F]">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <CheckCheck className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Link href="/notifications">
                <Button variant="ghost" size="sm" className="text-xs">
                  View all
                </Button>
              </Link>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#5C3A1F] mx-auto"></div>
                <p className="text-sm text-[#A0A0A0] mt-2">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-[#A0A0A0] mx-auto mb-2" />
                <p className="text-sm text-[#A0A0A0]">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-[#E5E5E5]">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-[#FDFBF7] transition-colors ${
                      notification.status === 'unread' ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[#5C3A1F] truncate">
                              {notification.title}
                            </p>
                            <p className="text-xs text-[#A0A0A0] mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-[#A0A0A0] mt-1">
                              {formatTimeAgo(notification.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            {notification.status === 'unread' && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 text-[#A0A0A0] hover:text-[#5C3A1F] transition-colors"
                                title="Mark as read"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-1 text-[#A0A0A0] hover:text-[#CE1126] transition-colors"
                              title="Delete notification"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 5 && (
            <div className="p-3 border-t border-[#E5E5E5] text-center">
              <Link href="/notifications">
                <Button variant="ghost" size="sm" className="text-xs">
                  View all {notifications.length} notifications
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
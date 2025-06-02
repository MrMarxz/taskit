'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Kanban,
  List,
  FolderOpen,
  BarChart3,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  Menu
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface SidebarProps {
  className?: string
}

const sidebarItems = [
  {
    title: 'Board',
    href: '/',
    icon: Kanban
  },
  {
    title: 'Backlog',
    href: '/backlog',
    icon: List
  },
  // {
  //   title: 'Projects',
  //   href: '/projects',
  //   icon: FolderOpen
  // },
  // {
  //   title: 'Analytics',
  //   href: '/analytics',
  //   icon: BarChart3
  // }
]

const bottomItems = [
  {
    title: 'Profile',
    href: '#profile',
    icon: User
  },
  {
    title: 'Settings',
    href: '#settings',
    icon: Settings
  }
]

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={cn(
        'flex flex-col h-screen bg-slate-900 border-r border-slate-700 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!isCollapsed && (
          <h2 className="text-xl font-semibold text-slate-100">
            Task-It
          </h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-slate-400 hover:text-slate-100 hover:bg-slate-800 h-8 w-8 p-0"
        >
          {isCollapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start text-left h-12 px-4 rounded-xl transition-all duration-200, my-2',
                  'text-slate-300 hover:text-slate-100',
                  'hover:bg-slate-800/70 hover:shadow-lg',
                  isActive && 'bg-slate-700/80 text-slate-100 shadow-md border border-slate-600',
                  isCollapsed && 'px-0 justify-center'
                )}
              >
                <Icon size={20} className={cn('flex-shrink-0', !isCollapsed && 'mr-3')} />
                {!isCollapsed && (
                  <span className="font-medium">{item.title}</span>
                )}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 space-y-2 border-t border-slate-700">
        {bottomItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start text-left h-12 px-4 rounded-xl transition-all duration-200',
                  'text-slate-300 hover:text-slate-100',
                  'hover:bg-slate-800/70 hover:shadow-lg',
                  isActive && 'bg-slate-700/80 text-slate-100 shadow-md border border-slate-600',
                  isCollapsed && 'px-0 justify-center'
                )}
              >
                <Icon size={20} className={cn('flex-shrink-0', !isCollapsed && 'mr-3')} />
                {!isCollapsed && (
                  <span className="font-medium">{item.title}</span>
                )}
              </Button>
            </Link>
          )
        })}
        
        {/* Logout Button */}
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start text-left h-12 px-4 rounded-xl transition-all duration-200',
            'text-red-400 hover:text-red-300',
            'hover:bg-red-900/20 hover:shadow-lg',
            isCollapsed && 'px-0 justify-center'
          )}
        >
          <LogOut size={20} className={cn('flex-shrink-0', !isCollapsed && 'mr-3')} />
          {!isCollapsed && (
            <span className="font-medium">Logout</span>
          )}
        </Button>
      </div>
    </div>
  )
}
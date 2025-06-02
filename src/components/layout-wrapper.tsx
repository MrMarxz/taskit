// components/layout-wrapper.tsx
'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    // Define routes that should NOT show the sidebar
    const excludedRoutes = ['/login', '/register', '/auth']
    const showSidebar = !excludedRoutes.some(route => pathname.startsWith(route))

    if (showSidebar) {
        return (
            <div className="flex h-screen">
                <Sidebar />
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    {children}
                </main>
            </div>
        )
    }

    return <>{children}</>
}
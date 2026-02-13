'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Bell,
    Home,
    LineChart,
    Package2,
    Settings,
    Users,
    Video,
    ClipboardCheck,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

const navItems = [
    { href: "/dashboard", label: "ホーム", icon: Home },
    { href: "/leads", label: "リスト抽出", icon: Users },
    { href: "/videos", label: "動画管理", icon: Video },
    { href: "/queue", label: "送信キュー", icon: LineChart },
    { href: "/onboarding", label: "オンボーディング", icon: ClipboardCheck },
    { href: "/settings", label: "設定", icon: Settings },
]

export function DashboardSidebar() {
    const pathname = usePathname()

    const isActive = (href: string) => {
        return pathname === href || pathname?.startsWith(href + '/')
    }

    return (
        <div className="hidden border-r border-gray-200 bg-white md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b border-gray-200 px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900">
                        <Package2 className="h-6 w-6" />
                        <span className="">V-Lync</span>
                    </Link>
                    <Button variant="outline" size="icon" className="ml-auto h-8 w-8 border-gray-200">
                        <Bell className="h-4 w-4 text-gray-500" />
                        <span className="sr-only">Toggle notifications</span>
                    </Button>
                </div>
                <div className="flex-1 py-2">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-0.5">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const active = isActive(item.href)

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150 relative",
                                        active
                                            ? "bg-blue-50 text-blue-700 font-medium"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100"
                                    )}
                                >
                                    {active && (
                                        <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-blue-600 rounded-r-full" />
                                    )}
                                    <Icon className={cn(
                                        "h-4 w-4 transition-colors",
                                        active ? "text-blue-600" : "text-gray-500"
                                    )} />
                                    <span>{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>
                <div className="mt-auto p-4">
                    <Card className="border-gray-200 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
                        <CardHeader className="p-4 pb-3">
                            <CardTitle className="text-sm font-semibold text-gray-900">Upgrade to Pro</CardTitle>
                            <CardDescription className="text-xs text-gray-600">
                                毎日100通を考えずに自動最適化
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                                Upgrade
                            </Button>
                            <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
                                除外・補完・優先送信を自動化
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

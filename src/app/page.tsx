import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 selection:bg-blue-100 selection:text-blue-900">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xl font-bold tracking-tight">V-Lync</Link>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link href="#" className="hover:text-gray-900 transition-colors">機能</Link>
          <Link href="#" className="hover:text-gray-900 transition-colors">料金</Link>
          <Link href="#" className="hover:text-gray-900 transition-colors">事例</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-sm font-medium hover:bg-gray-100 text-gray-700">
              ログイン
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="rounded-full bg-black text-white px-5 text-sm hover:bg-gray-800 transition-all">
              無料で試す
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col pt-32 pb-20 px-6">

        {/* Hero Section */}
        <section className="mx-auto max-w-5xl text-center space-y-8 mt-10 md:mt-20">
          <div className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 mb-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
            NEW: Google Maps連携機能をリリース
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both delay-100">
            AI動画 × 自動営業で、<br className="hidden md:block" />
            リード獲得を革新する
          </h1>

          <p className="mx-auto max-w-2xl text-xl text-gray-500 leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-700 fill-mode-both delay-200">
            Google Mapsからリストを抽出し、パーソナライズされた動画を自動送信。<br className="hidden md:block" />
            営業の未来を、もっとシンプルに。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both delay-300">
            <Link href="/signup">
              <Button size="lg" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 text-base font-medium shadow-lg shadow-blue-600/20 transition-all hover:scale-105">
                無料で始める
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="rounded-full border-gray-200 text-gray-700 px-8 h-12 text-base font-medium hover:bg-gray-50 hover:text-gray-900 transition-all">
                ログイン
              </Button>
            </Link>
          </div>
        </section>

        {/* Feature Teaser / Visual Placeholder */}
        <section className="mx-auto max-w-6xl mt-24 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
          <div className="rounded-2xl border border-gray-200 bg-white/50 backdrop-blur shadow-2xl overflow-hidden aspect-video relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 via-white/50 to-purple-50/50 opacity-50 transition-opacity group-hover:opacity-70"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-400 font-medium">Dashboard Preview UI</p>
            </div>
            {/* 
                   Here we would typically place a Next.js Image component showing the dashboard screenshot.
                   For now, a placeholder div effectively communicates the layout.
                */}
          </div>
        </section>

      </main>

      <footer className="border-t border-gray-100 py-12 bg-gray-50">
        <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
          <p>&copy; 2024 V-Lync. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

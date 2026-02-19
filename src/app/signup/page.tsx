import { signup } from '@/app/signup/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from 'next/link'

export default function SignupPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-foreground">
                        アカウントを作成
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        すでにアカウントをお持ちですか？{' '}
                        <Link href="/login" className="font-medium text-primary hover:text-primary/90">
                            ログインはこちら
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6">
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div className="grid gap-2">
                            <Label htmlFor="email">メールアドレス</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder="name@company.com"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">パスワード</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div>
                        <Button formAction={signup} className="w-full">
                            登録する
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

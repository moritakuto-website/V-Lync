import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { VideoUpload } from "@/components/videos/video-upload"

export default async function VideosContent() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: videos } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="flex flex-1 flex-col gap-4">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">動画管理 (Video Management)</h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>マスター動画アップロード</CardTitle>
                    <CardDescription>
                        AI生成の元となる動画を登録します。
                    </CardDescription>
                    <div className="mt-2 p-2 bg-blue-50 text-blue-800 rounded-md text-xs">
                        <span className="font-bold">✓ 自動管理:</span> この動画は90日間、自動で再利用されます
                        <br />
                        <span className="opacity-80 pl-14 block sm:inline sm:pl-0">TTL切れ前に自動再生成されます（Pro）</span>
                    </div>
                </CardHeader>
                <CardContent>
                    <VideoUpload />
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {videos?.map((video) => (
                    <Card key={video.id}>
                        <CardHeader>
                            <CardTitle className="text-base">{video.type === 'master' ? 'マスター動画' : '生成済み動画'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="aspect-video bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                                Preview
                                {/* video tag would go here using video.storage_path */}
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">ID: {video.id}</p>
                        </CardContent>
                    </Card>
                ))}
                {!videos?.length && (
                    <div className="col-span-full flex items-center justify-center h-40 border rounded-md bg-muted/10 text-muted-foreground">
                        動画はまだありません。
                    </div>
                )}
            </div>
        </div>
    )
}

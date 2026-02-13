import DashboardLayout from '@/app/dashboard_layout'
import OnboardingWizard from './wizard'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function OnboardingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch current onboarding state
    const { data: settings } = await supabase
        .from('settings')
        .select('onboarding_step, onboarding_completed, pdf_asset_path, video_asset_path')
        .eq('user_id', user.id)
        .single()

    const { data: profile } = await supabase
        .from('profiles')
        .select('plan_type, company_name, rep_name, company_url')
        .eq('id', user.id)
        .single()

    const currentStep = settings?.onboarding_step || 1
    const isCompleted = settings?.onboarding_completed || false

    // Guard: Redirect to dashboard if already completed
    if (isCompleted) {
        redirect('/dashboard')
    }

    return (
        <DashboardLayout>
            <OnboardingWizard
                initialStep={currentStep}
                isCompleted={isCompleted}
                savedData={{
                    plan_type: profile?.plan_type || 'free',
                    company_name: profile?.company_name || '',
                    rep_name: profile?.rep_name || '',
                    company_url: profile?.company_url || '',
                    pdf_asset_path: settings?.pdf_asset_path || null,
                    video_asset_path: settings?.video_asset_path || null,
                }}
            />
        </DashboardLayout>
    )
}

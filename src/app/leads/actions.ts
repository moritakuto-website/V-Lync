'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function searchLeads(formData: FormData) {
    const prefectures = formData.getAll('prefectures[]') as string[]
    const keywordInput = formData.get('keyword') as string
    const categories = formData.getAll('categories') as string[]

    // Merge manual input keywords and checked categories
    const manualKeywords = keywordInput ? keywordInput.split(',').map(k => k.trim()).filter(k => k) : []
    const allKeywords = Array.from(new Set([...manualKeywords, ...categories]))

    if (allKeywords.length === 0 || prefectures.length === 0) {
        return // Handle empty search
    }

    const keyword = allKeywords.join(' ')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    // 1. Get Google Maps API Key from Settings
    const { data: settings } = await supabase
        .from('settings')
        .select('google_maps_key')
        .eq('user_id', user.id)
        .single()

    const apiKey = settings?.google_maps_key || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    let allLeads: any[] = []

    // Search for each prefecture
    for (const area of prefectures) {
        let leadsToInsert = []

        if (apiKey) {
            try {
                // 2. Call Google Places API (Text Search)
                const query = `${area} ${keyword}`
                const url = `https://places.googleapis.com/v1/places:searchText`

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Goog-Api-Key': apiKey,
                        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.businessStatus,places.types'
                    },
                    body: JSON.stringify({
                        textQuery: query,
                        languageCode: 'ja'
                    })
                })

                if (!response.ok) {
                    console.error('Google Places API Error:', await response.text())
                } else {
                    const data = await response.json()
                    if (data.places) {
                        leadsToInsert = data.places.map((place: any) => ({
                            user_id: user.id,
                            company_name: place.displayName?.text || '名称不明',
                            address: place.formattedAddress || '住所不明',
                            industry: keyword,
                            status: 'new'
                        }))
                    }
                }
            } catch (error) {
                console.error('Error fetching from Google Places:', error)
            }
        } else {
            // Fallback Mock Data if no key
            console.log('No API Key found, using mock data.')
            leadsToInsert = [
                { user_id: user.id, company_name: `${area}の${keyword} A社 (Mock)`, address: `${area} 1-1-1`, industry: keyword, status: 'new' },
                { user_id: user.id, company_name: `${area}の${keyword} B社 (Mock)`, address: `${area} 2-2-2`, industry: keyword, status: 'new' },
            ]
        }

        allLeads.push(...leadsToInsert)
    }

    // Deduplicate by company_name + address
    const uniqueLeads = Array.from(
        new Map(
            allLeads.map(lead => [`${lead.company_name}|${lead.address}`, lead])
        ).values()
    )

    if (uniqueLeads.length > 0) {
        const { error } = await supabase.from('leads').insert(uniqueLeads)
        if (error) {
            console.error('Error inserting leads:', error)
        }
    }

    revalidatePath('/leads')
}

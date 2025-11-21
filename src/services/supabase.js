import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabaseClient

if (supabaseUrl && supabaseKey) {
    supabaseClient = createClient(supabaseUrl, supabaseKey)
} else {
    console.warn('Supabase credentials not found. Chat history will not be saved.')
    // Mock client to prevent crashes
    supabaseClient = {
        from: () => ({
            insert: () => Promise.resolve({ error: null }),
            select: () => ({
                order: () => ({
                    limit: () => Promise.resolve({ data: [], error: null })
                })
            })
        })
    }
}

export const supabase = supabaseClient

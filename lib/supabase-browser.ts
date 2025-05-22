"use client"

import { createClient } from "@supabase/supabase-js"

// Create a singleton instance for the browser
let browserSupabase: ReturnType<typeof createClient> | null = null

export function getSupabaseBrowser() {
  if (browserSupabase) return browserSupabase

  browserSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  })

  return browserSupabase
}

export const supabase = getSupabaseBrowser()

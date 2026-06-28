import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://uxkjvbjlsbgmbalokisf.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4a2p2Ympsc2JnbWJhbG9raXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMDEzOTAsImV4cCI6MjA5MTc3NzM5MH0.eOtAl-n3qNSLR0BQNKhr8jiE5qXResibjKVut0fpEHQ'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
export const USER_ID = 'drika'

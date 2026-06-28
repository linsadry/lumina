import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://uxkjvbjlsbgmbalokisf.supabase.co'
const SUPABASE_ANON_KEY = 'COLE_SUA_ANON_KEY_AQUI'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
export const USER_ID = 'drika'

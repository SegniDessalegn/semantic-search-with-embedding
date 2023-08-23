import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv"
config()

const supabase = createClient(process.env.SUPABASE_PROJECT_URL, process.env.SUPABASE_SECRET_KEY, {
    auth: {
        persistSession: false
    }
})

export { supabase }

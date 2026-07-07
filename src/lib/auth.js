import { supabase } from "./supabase";

export async function getOrCreateSession() {
    //check if they are a returning visitor or not
    const { data: { session } } = await supabase.auth.getSession()

    if ( session ) return session

    const { data, error } = await supabase.auth.signInAnonymously()

    if (error) {
        console.error('Auth error:', error)
        return null
    }

    return data.session
    
}
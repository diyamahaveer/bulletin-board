import { supabase } from "./supabase";

let sessionPromise = null
export function getOrCreateSession() {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) return session
      const { data, error } = await supabase.auth.signInAnonymously()
      if (error) { sessionPromise = null; throw error }
      return data.session
    })()
  }
  return sessionPromise
}
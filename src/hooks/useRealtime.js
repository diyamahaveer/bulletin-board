import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export function useRealtime(currentUserId){
    const queryClient = useQueryClient()

    useEffect(() => {
        // open a Websocket channel subscribed to all changes on the notes table
        const channel = supabase
            .channel('notes-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'notes' },
                (payload) => {
                    //occurs when any notes are updated, inserted, and deleted
                    queryClient.invalidateQueries({ queryKey: ['notes'] })
                }
            )
            .subscribe()

        //cleanup which closes the websocket
        return () => {
            supabase.removeChannel(channel)
        }
    }, [])
}
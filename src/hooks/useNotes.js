import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from '../lib/supabase';

//FETCH all notes
async function fetchNotes(userId) {
    const { data, error } = await supabase
        .from('notes')
        .select(`
            *,
            note_likes(user_id)
        `)
        .order('created_at', { ascending: true })

    if (error) throw error
    return data.map(note => ({
        ...note,
        likedByMe: note.note_likes.some(l => l.user_id === userId),

    }))
    
}

export function useNotes(currentUserId) {
    const queryClient = useQueryClient()

    //READ - fetches all notes on mount & caches them
    const { data: notes = [], isLoading } = useQuery({
        queryKey: ['notes', currentUserId],
        queryFn: () => fetchNotes(currentUserId),
        enabled: true,
    })

    //CREATE
    const createNote = useMutation({
        mutationFn: async ({ x, y, color }) => {  // color param
            const { data: { user } } = await supabase.auth.getUser()
            const { data, error } = await supabase
                .from('notes')
                .insert({ x, y, color, user_id: user.id })  //pass color
                .select()
                .single()
            if (error) throw error
            return data
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
    })

    //UPDATE POSITION - drag end
    const updatePosition = useMutation({
        mutationFn: async ({ id, x, y }) => {
            const { error } = await supabase
                .from('notes')
                .update({ x, y })
                .eq('id', id)
            if (error) throw error
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
    })

    //UPDATE TEXT
    const updateText = useMutation({
        mutationFn: async ({ id, content }) => {
            const { error } = await supabase
                .from('notes')
                .update({ content })
                .eq('id', id)
            if (error) throw error
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),

    })

    //RECOLOR
    const recolorNote = useMutation({
        mutationFn: async ({ id, color }) => {
            const { error } = await supabase
                .from('notes')
                .update({ color })
                .eq('id', id)
            if (error) throw error
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
    })

    //DELETE
    const deleteNote = useMutation({
        mutationFn: async ({ id }) => {
            const { error } = await supabase
                .from('notes')
                .delete()
                .eq('id', id)
            if (error) throw error
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
    })

    //REPORT NOTES
    const reportNote = useMutation({
        mutationFn: async ({ id }) => {
            const { data: { user } } = await supabase.auth.getUser()
            const { error } = await supabase
                .from('note_reports')
                .insert({ note_id: id, user_id: user.id })
            if (error) throw error
        },
        onError: (err) => console.error('report failed:', err.message),
        
    })

    //LIKE NOTES
    const likeNote = useMutation({
        mutationFn: async ({ id }) => {
            const { data: { user } } = await supabase.auth.getUser()
            const { error } = await supabase
                .from('note_likes')
                .insert({ note_id: id, user_id: user.id })
            if (error) throw error
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),

    })

    //UNLIKE NOTES
    const unlikeNote = useMutation({
        mutationFn: async ({ id }) => {
            const { data: { user } } = await supabase.auth.getUser()
            const { error } = await supabase
                .from('note_likes')
                .delete()
                .eq('note_id', id)
                .eq('user_id', user.id)
            if (error) throw error
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
    })


    return {
        notes,
        isLoading,
        createNote,
        updatePosition,
        updateText,
        recolorNote,
        deleteNote,
        likeNote,
        unlikeNote,
        reportNote,
    }

}
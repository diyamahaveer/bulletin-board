import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

export default function ShareRedirect() {
    const { shareId } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        async function lookupNote() {
            const { data, error } = await supabase
                .from('notes')
                .select('x, y, id')
                .eq('share_id', shareId)
                .single()

            if (error || !data ) {
                //note not found
                navigate('/')
                return
            }

            //redirect 
            navigate(`/?noteX=${data.x}&noteY=${data.y}&highlightId=${data.id}`)
        }

        lookupNote()
    }, [shareId])

    return (
        <div className='w-screen h-screen flex items-center justify-center bg-stone-100'>
            <p className='text-gray-400 text-sm'>finding note...</p>
        </div>
    )

}

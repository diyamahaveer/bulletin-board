import { useEffect, useRef, useState } from 'react'
import StickyNote from './StickyNote'
import { useNotes } from '../hooks/useNotes';
import { supabase } from '../lib/supabase';
import { useRealtime } from '../hooks/useRealtime'

export default function Board({ initialFocusX = null, initialFocusY = null, highlightId = null }){
    //the offset is how far we've moved on your canvas from the starting position and x moves left/right and y moves up/down
    // 0, 0 means we haven't moved yet
    const[offset, setOffset] = useState({x: 0 , y: 0});
    //scale tracks the zoom level of the canvas
    // 1 means 100% zoom, 0.5 means zoomed out, 2 means zoomed in
    const [scale, setScale] = useState(1)
    //tracks if the user is currently searching, or moving around
    const[isDragging, setIsDragging] = useState(false)
    //tracks highlighting notes
    const[activeHighlightId, setActiveHighlightId] = useState(highlightId)
    //this is for users
    const[currentUserId, setCurrentUserId] = useState(null)
    //dragStart tracks where the user is and how far they have moved
    //we use useRef that's null meaning it's current {null}
    const dragStart = useRef(null)
    //notes array
    
    const { notes, isLoading, createNote, updatePosition, updateText, recolorNote, deleteNote, reportNote, likeNote, unlikeNote} = useNotes(currentUserId)
    useRealtime(currentUserId)

    //this function occurs when someone presses the mouse button down on the baord
    const handleMouseDown = (e) => {
        //e is the event object that is passed to the event handler automatically and this one is checking which button was clicked
        //if it's not a left click then we ignore it and stop function
        console.log('board mouse down fired')
        if(e.button !== 0){
            return;
        }

        //set dragging to true because we started dragging
        setIsDragging(true);
        //four values for current and they calculate the movement
        dragStart.current = {
            //where mouse was on screen when the drag started
            mouseX: e.clientX,
            mouseY: e.clientY,
            //where the canvas was when the drag started
            offsetX: offset.x,
            offsetY: offset.y,
        }
    }

    const handleCreateNote = () => {
        //center of the screen in pixels
        const screenCenterX = window.innerWidth / 2
        const screenCenterY = window.innerHeight / 2

        //convert to world coordinates
        const worldX = (screenCenterX - offset.x) / scale
        const worldY = (screenCenterY - offset.y) / scale

        createNote.mutate({ x: worldX, y: worldY })
    }

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setCurrentUserId(user?.id ?? null)
        })
    }, [])

    useEffect(() => {
        if(initialFocusX === null || initialFocusY === null) return

        //pan the canvas so the shared note appears in the center of the screen
        const screenCenterX = window.innerWidth / 2
        const screenCenterY = window.innerHeight / 2

        setOffset({
            x: screenCenterX - initialFocusX * scale,
            y: screenCenterY - initialFocusY * scale,
        })

        //clear the highlight after 3 seconds
        setTimeout(() => setActiveHighlightId(null), 3000)
    }, [initialFocusX, initialFocusY])

    //this useEffect sets up the mouse move and mouse up listeners
    //this is for panning
    //it re-runs whenever isDragging changes so the handlers is always updated
    useEffect(() => {
        const handleMouseMove = (e) => {
            //if we are not dragging or dragStart is empty, do nothing
            if(!isDragging || !dragStart.current){
                return;
            }

            //how far has the mouse moved since we started dragging
            const dx = e.clientX - dragStart.current.mouseX;
            const dy = e.clientY - dragStart.current.mouseY;

            //update the canvas position by adding the distance traveled to where the canvas started
            setOffset({
                x: dragStart.current.offsetX + dx,
                y: dragStart.current.offsetY + dy,
            })
        }

        //handleMouseUp fires when the user releases the mouse button
        const handleMouseUp = () => {
            setIsDragging(false);
            //clear the snapshot so it's ready for the next drag
            dragStart.current = null;
        }

        //attach both listeners to the window and not the div
        window.addEventListener('pointermove', handleMouseMove);
        window.addEventListener('pointerup', handleMouseUp);

        return () => {
            //cleanup function
            window.removeEventListener('pointermove', handleMouseMove);
            window.removeEventListener('pointerup', handleMouseUp);
        }
    }, [isDragging]) //dependency array

    //this useEffect sets up the scroll wheel zoom listener
    useEffect(() => {
        const handleWheel = (e) => {
            e.preventDefault();

            if (e.ctrlKey || e.metaKey) {
                //normalize delta across borders
                const delta = e.deltaY * (e.deltaMode === 1 ? -0.05 : -0.01)
                const newScale = Math.min(Math.max(scale * (1 + delta), 0.02), 5);

                //world coordinates currently under the cursor
                const worldX = (e.clientX - offset.x) / scale;
                const worldY = (e.clientY - offset.y) / scale;

                setOffset({
                    x: e.clientX - worldX * newScale,
                    y: e.clientY - worldY * newScale,
                })
                setScale(newScale);
            } else {
                // two-finger scroll / pan
                setOffset((prev) => ({
                    x: prev.x - e.deltaX,
                    y: prev.y - e.deltaY,
                }))
            }
        }

        window.addEventListener('wheel', handleWheel, { passive: false});
        return () => window.removeEventListener('wheel', handleWheel);
    }, [scale, offset]) //empty dependency: it runs once when the component first appears

    return (
        <div
        className='w-screen h-screen overflow-hidden bg-stone-100'
        style={{cursor: isDragging ? 'grabbing' : 'grab'}}
        onPointerDown={handleMouseDown}
        >

            {isLoading && (
                <div className='fixed top-4 left-1/2 -translate-x-1/2 text-sm text-gray-400 bg-white px-3 py-1 rounded-full shadow'>
                    loading notes...
                </div>
            )}

            <button
                className='fixed bottom-8 right-8 w-12 h-12 bg-yellow-400 hover:bg-yellow-500 text-white text-2xl rounded-full shadow-lg z-10 flex items-center justify-center'
                onClick={handleCreateNote}
            >
                +
            </button>

            <div
            style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                transformOrigin: '0 0',
                width:'100%',
                height: '100%',
                position: 'relative',
            }}
            >
                {notes.map((note) => (
                    <StickyNote
                    key={note.id}
                    id={note.id}
                    x={note.x}
                    y={note.y}
                    color={note.color}
                    content={note.content}
                    isOwner={note.user_id === currentUserId}
                    likeCount={note.likeCount}
                    likedByMe={note.likedByMe}
                    isHighlighted={note.id === activeHighlightId}
                    offset={offset}
                    scale={scale}

                    onDragEnd={(x, y) => 
                        updatePosition.mutate({ id: note.id, x, y })
                    }
                    onTextSave={(text) => 
                        updateText.mutate({ id: note.id, content: text })
                    }
                    onRecolor={(color) => 
                        recolorNote.mutate({ id: note.id, color})
                    }
                    onDelete={() =>
                        deleteNote.mutate({ id: note.id })
                    }

                    onShare={() => {
                        const shareUrl = `${window.location.origin}/note/${note.share_id}`
                        navigator.clipboard.writeText(shareUrl)
                    }}
                    onLike={() => {
                        const note_data = notes.find(n => n.id === note.id)
                        if(note_data?.likedByMe){
                            unlikeNote.mutate({ id: note.id })
                        } else {
                            likeNote.mutate({ id: note.id })
                        }
                    }}
                    onReport={() => console.log('report', note.id)}
                    />
                
                ))}
            </div>
        </div>
    )
}

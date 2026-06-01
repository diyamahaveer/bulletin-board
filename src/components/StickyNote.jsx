import { useEffect, useRef, useState } from 'react'

export default function StickyNote({ 
  id,
  x, 
  y, 
  color, 
  content,
  isOwner,
  offset,
  onDragEnd,
  onTextSave,
}){
    //tracks if the user is dragging sticky note
    const[isDragging, setIsDragging] = useState(false);
    //tracks the editing and whether that's happening or not
    const[isEditing, setIsEditing] = useState(false);
    //tracks the text and rerenders
    const [text, setText] = useState(content);
    //dragStart tracks where the sticky note is and how far they have moved
    //we use useRef that's null meaning it's current {null}
    const dragStart = useRef(null);
    //this is the last location which we send to supabase once set
    const lastLoc = useRef({x, y});



    //this function occurs when someone presses the mouse button down on the baord
    const handleMouseDown = (e) => {
        //e is the event object that is passed to the event handler automatically and this one is checking which button was clicked
        //if it's not a left click then we ignore it and stop function
        if(e.button !== 0){
            return;
        }

        e.stopPropagation()

        //set dragging to true because we started dragging
        setIsDragging(true);
        //four values for current and they calculate the movement
        dragStart.current = {
            //where mouse was on screen when the drag started
            mouseX: e.clientX,
            mouseY: e.clientY,
            //where the canvas was when the drag started
            noteX: lastLoc.current.x,
            noteY: lastLoc.current.y,
        }
    }

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
            lastLoc.current = {
                x: dragStart.current.noteX + dx,
                y: dragStart.current.noteY + dy,
            }

            setIsDragging(true);//force a rerender so the note visually moves
        }

        //handleMouseUp fires when the user releases the mouse button
        const handleMouseUp = () => {
            if(!isDragging){
                return
            }
            setIsDragging(false);
            //clear the snapshot so it's ready for the next drag
            dragStart.current = null;
            onDragEnd(lastLoc.current.x, lastLoc.current.y);
        }

        //attach both listeners to the window and not the div
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            //cleanup function
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
    }, [isDragging]) //dependency array

    return (
        <div
        className='absolute rounded-lg shadow-lg w-48 min-h-24 cursor-grab active:cursor-grabbing'
        style={{
            left: lastLoc.current.x,
            top: lastLoc.current.y,
            backgroundColor: color,
            boxShadow: isEditing
                ? '0 0 0 3px rgba(59, 130, 246, 0.6)'
                : '0 4px 6px rgba(0,0,0,0.1)',
        }}
        onMouseDown={handleMouseDown}
        >
            <div className= 'flex justify-end p-1'>
                <button
                    className= 'text-gray-500 hover:text-gray-800 text-lg leading-none'
                    onClick={(e) => {
                        e.stopPropagation();

                    }}
                >
                ...
                </button>
            </div>
            {/* text area */}
            <div className='px-3 pb-3'>
                {isEditing ? (
                    <textarea
                        autoFocus
                        className='w-full bg-transparent resize-none outline-none text-sm text-gray-800 placeholder-gray-400'
                        placeholder='type something'
                        value={text}

                        onChange={(e) => setText(e.target.value)}
                        onBlur={() => {
                            setIsEditing(false);
                            onTextSave(text)
                        }}

                        onMouseDown={(e) => e.stopPropagation()}
                    />

                    ) : (
                        <p
                        className='text-sm text-gray-800 min-h-12 cursor-text'
                        onClick={() =>{
                            if(isOwner){
                                setIsEditing(true);
                            }
                        }}
                        >
                            {text || (
                                <span className='text-gray-400'>type something</span>
                            )}
                        </p>
                    )}

                </div>

            </div>
    )
}

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import { useBoard } from '../store/useBoard';
import NoteMenu from './NoteMenu';

export default function StickyNote({ 
  id,
  x, 
  y, 
  color, 
  content,
  isOwner,
  offset,
  scale = 1,
  onDragEnd,
  onTextSave,
  onRecolor = () => {},
  onDelete = () => {},
  onShare = () => {},
  onLike = () => {},
  onReport = () => {},
}){
    //tracks the editing and whether that's happening or not
    const[isEditing, setIsEditing] = useState(false);
    //tracks the text and rerenders
    const [text, setText] = useState(content);

    //motionX/motionY drive the note's position via CSS transform
    //prevents dragging from rerendering
    const motionX = useMotionValue(x);
    const motionY = useMotionValue(y);

    //tracks whether THIS user is currently dragging so position incoming
    const isDraggingRef = useRef(false);

    //this is to track the toggleMenu state
    const toggleMenu = useBoard((state) => state.toggleMenu)

    //if x/y props change from the outside and smoothly animate to the new 
    //position but only if not actively dragging
    useEffect(() => {
        if(!isDraggingRef.current){
            animate(motionX, x, { type: 'spring', stiffness: 400, damping: 35})
            animate(motionY, y, { type: 'spring', stiffness: 400, damping: 35})
        }
    }, [x, y])

    const handleDragStart = () => {
        isDraggingRef.current = true;
    }

    const handleDragEnd = () => {
        isDraggingRef.current = false;
        onDragEnd(motionX.get(), motionY.get());
    }

    const handleDrag = (event, info) => {
        //we want to scale by 1/scale to correct the difference
        motionX.set(motionX.get() + info.delta.x / scale);
        motionY.set(motionY.get() + info.delta.y / scale);
    }

    return (
        <motion.div
        drag
        dragMomentum={false}
        dragElastic={0}
        onMouseDown={(e) => e.stopPropagation()}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDrag={handleDrag}
        style={{
            x: motionX,
            y: motionY,
            left: 0,
            top: 0,
            backgroundColor: color,
            touchAction: 'none',
            userSelect: 'none',
            boxShadow: isEditing
                ? '0 0 0 3px rgba(59, 130, 246, 0.6)'
                : '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
        className='absolute rounded-lg shadow-lg w-48 min-h-24 cursor-grab active:cursor-grabbing'
        >
            {/* three-dot menu */}
            <div className='flex justify-end p-1'>
                <button
                    className='text-gray-500 hover:text-gray-800 text-lg leading-none'
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation()
                        toggleMenu(id);
                    }}
                >
                    ...
                </button>
                <NoteMenu
                    id={id}
                    isOwner={isOwner}
                    onRecolor={onRecolor}
                    onDelete={onDelete}
                    onShare={onShare}
                    onLike={onLike}
                    onReport={onReport}
                />
            </div>

            {/* text area */}
            <div className='px-3 pb-3'>
                {isEditing ? (
                    <textarea
                        autoFocus
                        className='w-full bg-transparent resize-none outline-none text-sm text-gray-800 placeholder-gray-400'
                        placeholder='type something'
                        value={text}
                        style={{ userSelect: 'text' }}
                        onChange={(e) => setText(e.target.value)}
                        onBlur={() => {
                            setIsEditing(false)
                            onTextSave(text)
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                    />
                ) : (
                    <p
                        className='text-sm text-gray-800 min-h-12 cursor-text'
                        onPointerDown={(e) => {
                            if(isOwner) e.stopPropagation()
                        }}
                        onClick={() => {
                            if(isOwner){
                                setIsEditing(true)
                            }
                        }}
                    >
                        {text || <span className="text-gray-400">type something</span>}
                    </p>

                    )}
            </div>

        </motion.div>
    )
}

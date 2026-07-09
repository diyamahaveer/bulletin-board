import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import { useBoard } from '../store/useBoard';
import NoteMenu, { TEXT_COLOR_MAP } from './NoteMenu';

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
  likedByMe = false,
  isHighlighted = false,
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

    const [currentColor, setCurrentColor] = useState(color);

    //tracks whether THIS user is currently dragging so position incoming
    const isDraggingRef = useRef(false);

    //this is to track the toggleMenu state
    const toggleMenu = useBoard((state) => state.toggleMenu);

    const pointerDown = useRef(false);

    const pointerStart = useRef({ x: 0, y: 0})

    const noteStart = useRef({ x: 0, y: 0 })

    const scaleRef = useRef(scale);

    const dynamicAccentColor = TEXT_COLOR_MAP[currentColor?.toLowerCase()] || '#B2A732';

    useEffect(() => {
        scaleRef.current = scale
    }, [scale])

    //if x/y props change from the outside and smoothly animate to the new 
    //position but only if not actively dragging
    useEffect(() => {
        if(!isDraggingRef.current){
            animate(motionX, x, { type: 'spring', stiffness: 400, damping: 35})
            animate(motionY, y, { type: 'spring', stiffness: 400, damping: 35})
        }
    }, [x, y])

    const handlePointerDown = (e) => {
        console.log('note pointer down fired')
        if (e.button !== 0) return
        e.stopPropagation()
        pointerDown.current = true;
        isDraggingRef.current = true;
        pointerStart.current = { x: e.clientX, y: e.clientY }
        noteStart.current = { x: motionX.get(), y: motionY.get() }
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
    }

    const handlePointerMove = (e) => {
        if (!pointerDown.current) return
        const dx = (e.clientX - pointerStart.current.x) / scaleRef.current
        const dy = (e.clientY - pointerStart.current.y) / scaleRef.current 
        motionX.set(noteStart.current.x + dx)
        motionY.set(noteStart.current.y + dy)
    }

    const handlePointerUp = () => {
        pointerDown.current = false;
        isDraggingRef.current = false;
        onDragEnd(motionX.get(), motionY.get())
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
    }

    return (
        <motion.div
            onPointerDown={(e) => {
                if (!isOwner) return
                const tag = e.target.tagName.toLowerCase()
                if (tag === 'button' || tag === 'textarea' || tag === 'p' || tag === 'span') return
                handlePointerDown(e)
            }}
            style={{
                x: motionX,
                y: motionY,
                left: 0,
                top: 0,
                backgroundColor: currentColor,
                touchAction: 'none',
                userSelect: 'none',
                boxShadow: isHighlighted
                ? '0 0 0 3px rgba(234, 179, 8, 0.6)'
                : isEditing
                    ? '0 0 0 3px rgba(59, 130, 246, 0.4)'
                    : '4px 4px 12px rgba(0,0,0,0.08)'
            }}
            className='absolute w-64 h-64 flex flex-col justify-between'
        >
            {/* three-dot menu */}
            <div className='flex justify-end px-4 pt-4 pb-0 z-10'>
                <button
                    className='text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-black/5'
                    style={{ color: dynamicAccentColor }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation()
                        toggleMenu(id)
                    }}
                >
                    <span className='flex gap-1'>
                        <span className='w-1.5 h-1.5 rounded-full bg-current inline-block' />
                        <span className='w-1.5 h-1.5 rounded-full bg-current inline-block' />
                        <span className='w-1.5 h-1.5 rounded-full bg-current inline-block' />
                    </span>
                </button>
                <NoteMenu
                    id={id}
                    isOwner={isOwner}
                    onRecolor={(newColor) => {
                        setCurrentColor(newColor)
                        onRecolor(newColor)
                    }}
                    onDelete={onDelete}
                    onShare={onShare}
                    onLike={onLike}
                    onReport={onReport}
                />
            </div>

            {/* text area */}
            <div className='px-5 pb-2 pt-1 grow flex flex-col'>
                {isEditing ? (
                    <textarea
                        className='w-full h-full bg-transparent resize-none outline-none text-base leading-relaxed grow text-black'
                        style={{ 
                            userSelect: 'text',
                            '--placeholder-color': dynamicAccentColor
                        }}
                        placeholder='type something'
                        value={text}
                        style={{ userSelect: 'text' }}
                        onChange={(e) => setText(e.target.value)}
                        onBlur={() => {
                            setIsEditing(false)
                            onTextSave(text)
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        autoFocus
                    />
                ) : (
                    <p
                        className={`w-full h-full text-base leading-relaxed wrap-break-word grow ${
                        text ? 'text-black' : '' } ${isOwner ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
                        onPointerDown={(e) => {
                            if (isOwner) e.stopPropagation()
                        }}
                        onClick={() => {
                            if (isOwner) setIsEditing(true)
                        }}
                    >
                        {text || (
                            <span style={{ color: dynamicAccentColor }}>
                                type something
                            </span>
                        )}
                    </p>
                )}
            </div>

            {/* likes count */}
            <div className='flex justify-end px-2.5 pb-1 pt-0'>
                <span 
                    className='text-2xl font-medium cursor-pointer select-none p-1 transition-transform active:scale-90'
                    style={{ color: likedByMe ? '#ef4444' : dynamicAccentColor }}
                    onClick={(e) => {
                        e.stopPropagation(); 
                        onLike();
                    }}
                    onPointerDown={(e) => e.stopPropagation()} 
                >
                    {'♥'}
                </span>
            </div>
        </motion.div>
    )
}

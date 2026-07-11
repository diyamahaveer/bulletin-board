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

    const noteStart = useRef({ x: 0, y: 0 });

    const scaleRef = useRef(scale);

    //ref to the textarea so we can measure whether new text actually
    //fits inside the box, rather than guessing with a weighted char count
    const textareaRef = useRef(null);

    const dynamicAccentColor = TEXT_COLOR_MAP[currentColor?.toLowerCase()] || '#B2A732';

    const openMenuId = useBoard((state) => state.openMenuId);
    const isMenuOpen = openMenuId === id;

    //generous hard ceiling, just to stop database/storage abuse.
    //this is NOT what stops normal typing -- the overflow check in
    //handleTextChange is what actually enforces "does it fit on the note"
    const SAFE_MAX = 600;

    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }

    //font shrinks as text grows so more content can fit before it
    //ever needs to overflow
    const fontSize = Math.max(14, 28 - Math.floor(text.length / 15));

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
        e.stopPropagation();
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

    const handlePointerUp = (e) => {
        pointerDown.current = false;
        isDraggingRef.current = false;
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)

        const totalDx = e.clientX - pointerStart.current.x;
        const totalDy = e.clientY - pointerStart.current.y;
        const moved = Math.hypot(totalDx, totalDy) > 4;

        if(moved) {
            onDragEnd(motionX.get(), motionY.get());
        } else if (isOwner){
            setIsEditing(true);
        }
    }

    //checks the actual rendered textarea after each keystroke -- if the
    //new text would overflow the box, the keystroke is undone. this
    //replaces guessing at a weighted character limit with a real
    //measurement of whether the content fits
    const handleTextChange = (e) => {
        const value = e.target.value;
        if (value.length > SAFE_MAX) return; // hard backstop only

        const previous = text;
        setText(value);

        requestAnimationFrame(() => {
            const el = textareaRef.current;
            if (el && el.scrollHeight > el.clientHeight + 1) {
                setText(previous); // didn't fit -- undo this keystroke
            }
        });
    }

    return (
        <motion.div
            onPointerDown={(e) => {
                if (!isOwner) return
                const tag = e.target.tagName.toLowerCase()
                if (tag === 'button' || tag === 'textarea') return
                handlePointerDown(e)
            }}
            style={{
                x: motionX,
                y: motionY,
                left: 0,
                top: 0,
                zIndex: isMenuOpen ? 1000 : 1,
                backgroundColor: currentColor,
                touchAction: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                boxShadow: isHighlighted
                ? `0 0 0 3px ${hexToRgba(dynamicAccentColor, 0.6)}`
                : isEditing
                    ? '0 0 0 3px rgba(59, 130, 246, 0.4)'
                    : '4px 4px 12px rgba(0,0,0,0.08)'
            }}
            className='absolute w-80 h-80 flex flex-col justify-between'
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
            <div className='px-5 pb-2 pt-1 grow flex flex-col min-h-0 overflow-hidden'>
                {isEditing ? (
                    <textarea
                        ref={textareaRef}
                        className='w-full h-full bg-transparent resize-none outline-none leading-relaxed grow text-black'
                        style={{ 
                            userSelect: 'text',
                            fontSize: `${fontSize}px`,
                            '--placeholder-color': dynamicAccentColor
                        }}
                        placeholder='type something'
                        value={text}
                        onChange={handleTextChange}
                        onBlur={() => {
                            setIsEditing(false)
                            onTextSave(text)
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        autoFocus
                    />
                ) : (
                    <p
                        className={`w-full h-full leading-relaxed break-words grow ${
                        text ? 'text-black' : '' } ${isOwner ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
                        style={{ whiteSpace: 'pre-wrap', fontSize: `${fontSize}px` }}
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

            {/* likes count, or a live char count while editing */}
            <div className='flex justify-end px-2.5 pb-1 pt-0'>
                {isEditing ? (
                <span
                    className='text-xs font-medium select-none px-1 tabular-nums'
                    style={{ color: dynamicAccentColor }}
                >
                    {text.length} chars
                </span>
            ) : (
                <span className='text-3xl font-medium cursor-pointer select-none p-1 transition-transform active:scale-90' 
                style={{ color: likedByMe ? '#ef4444' : dynamicAccentColor }}
                onClick={(e) => {
                    e.stopPropagation(); 
                    onLike();
                }}
                onPointerDown={(e) => e.stopPropagation()}
            >
                    {'♥'}
                </span>
            )}
            </div>
        </motion.div>
    )
}
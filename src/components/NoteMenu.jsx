import { useEffect, useRef } from 'react'
import { useBoard } from '../store/useBoard'

//preset colors for the sticky notes
const COLOR_OPTIONS = [
    '#fef08a', // yellow
    '#fecaca', // pink
    '#bfdbfe', // blue
    '#bbf7d0', // green
    '#e9d5ff', // purple
    '#fed7aa', // orange
]
export default function NoteMenu({
    id,
    isOwner,
    onRecolor,
    onDelete,
    onShare,
    onLike,
    onReport,
}){
    const openMenuId = useBoard((state) => state.openMenuId);
    const closeMenu = useBoard((state) => state.closeMenu);
    const menuRef = useRef(null);

    const isOpen = openMenuId === id;

    useEffect(() => {
        if(!isOpen) return;

        const handleClickOutside = (e) => {
            if(menuRef.current && !menuRef.current.contains(e.target)){
                closeMenu();
            }
        }

        window.addEventListener('mousedown', handleClickOutside);
        return () => window.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, closeMenu])

    if(!isOpen) return null;

    return (
        <div
            ref={menuRef}
            className='absolute right-1 top-8 z-10 w-40 rounded-lg bg-white shadow-lg border border-gray-200 py-1 text-sm'
            onMouseDown={(e) => e.stopPropagation()}
        >
            {isOwner ? (
                <>
                    <div className='px-3 py-1 text-xs text-gray-400'>Recolor</div>
                    <div className='flex gap-2 px-3 pb-2'>
                        {COLOR_OPTIONS.map((color) => (
                            <button
                            key={color}
                            className='w-5 h-5 rounded-full border border-gray-300'
                            style={{ backgroundColor: color }}
                            onClick={() => {
                                onRecolor(color)
                                closeMenu()
                            }}
                            />
                        ))}
                    </div>
                    <hr className='border-gray-100'/>
                    <MenuItem
                        label='share'
                        onClick={() => {
                            onShare()
                            closeMenu()
                        }}
                    />
                    <MenuItem
                        label='delete'
                        danger
                        onClick={() => {
                            onDelete()
                            closeMenu()
                        }}
                    />
                </>
            ) : (
                <>
                    <MenuItem
                        label='like'
                        onClick={() => {
                            onLike()
                            closeMenu()
                        }}
                    />
                    <MenuItem
                        label='share'
                        onClick={() => {
                            onShare()
                            closeMenu()
                        }}
                    />
                    <MenuItem
                        label='report'
                        danger
                        onClick={() => {
                            onReport()
                            closeMenu()
                        }}
                    />
                </>
            )}
        </div>
    )
}

function MenuItem({ label, onClick, danger }) {
    return (
        <button
            className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 ${
                danger ? 'text-red-600' : 'text-gray-700'
            }`}
            onClick={onClick}
        >
            {label}
        </button>
    )
}

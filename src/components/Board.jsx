import { useEffect, useRef, useState } from 'react'

export default function Board(){
    //the offset is how far we've moved on your canvas from the starting position and x moves left/right and y moves up/down
    const[offset, setOffset] = useState({x: 0 , y: 0});
    const [scale, setScale] = useState(1)
    //tracks if the user is currently searching, or moving around
    const[isDragging, setIsDragging] = useState(false);
    //dragStart tracks where the user is and how far they have moved
    const dragStart = useRef(null);

    const handleMouseDown = (e) => {
        if(e.button !== 0){
            return;
        }

        setIsDragging(true);
        dragStart.current = {
            mouseX: e.clientX,
            mouseY: e.clientY,
            offsetX: offset.x,
            offsetY: offset.y,
        }
    }

    useEffect(() => {
        const handleMouseMove = (e) => {
            if(!isDragging || !dragStart.current){
                return;
            }

            //how far has the mouse moved since we started dragging
            const dx = e.clientX - dragStart.current.mouseX;
            const dy = e.clientY - dragStart.current.mouseY;

            setOffset({
                x: dragStart.current.offsetX + dx,
                y: dragStart.current.offsetY + dy,
            })
        }

        const handleMouseUp = () => {
            setIsDragging(false);
            dragStart.current = null;
        }

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
    }, [isDragging])

    useEffect(() => {
        const handleWheel = (e) =>{
            e.preventDefault();
            setScale((prev) => {
                const delta = e.deltaY * -0.001;
                return Math.min(Math.max(prev + delta, 0.2), 3);
            })
        }

        window.addEventListener('wheel', handleWheel, { passive: false});
        return () => window.removeEventListener('wheel', handleWheel);
    }, [])

    return (
        <div
        className="w-screen h-screen overflow-hidden bg-stone-100"
        style={{cursor: isDragging ? 'grabbing' : 'grab'}}
        onMouseDown={handleMouseDown}
        >
            <div
            style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                transformOrigin: '0 0',
                width:'100%',
                height: '100%',
                position: 'relative',
            }}
            >
                <div
                className="absolute bg-yellow-300 rounded shadow p-4 text-sm"
                style={{left: 200, top: 200}}
                >
                    sticky note will go here
                </div>
            </div>
        </div>
    )
}

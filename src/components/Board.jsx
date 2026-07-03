import { useEffect, useRef, useState } from 'react'
import StickyNote from './StickyNote'
import { color } from 'framer-motion';

export default function Board(){
    //the offset is how far we've moved on your canvas from the starting position and x moves left/right and y moves up/down
    // 0, 0 means we haven't moved yet
    const[offset, setOffset] = useState({x: 0 , y: 0});
    //scale tracks the zoom level of the canvas
    // 1 means 100% zoom, 0.5 means zoomed out, 2 means zoomed in
    const [scale, setScale] = useState(1)
    //tracks if the user is currently searching, or moving around
    const[isDragging, setIsDragging] = useState(false);
    //dragStart tracks where the user is and how far they have moved
    //we use useRef that's null meaning it's current {null}
    const dragStart = useRef(null);

    //this function occurs when someone presses the mouse button down on the baord
    const handleMouseDown = (e) => {
        //e is the event object that is passed to the event handler automatically and this one is checking which button was clicked
        //if it's not a left click then we ignore it and stop function
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
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            //cleanup function
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
    }, [isDragging]) //dependency array

    //this useEffect sets up the scroll wheel zoom listener
    useEffect(() => {
        const handleWheel = (e) => {
            e.preventDefault();

            if (e.ctrlKey || e.metaKey) {

                const delta = e.deltaY * -0.01;
                const newScale = Math.min(Math.max(scale * (1 + delta), 0.1), 3);

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
                <StickyNote
                id="test-1"
                x={200}
                y={200}
                color="#fef08a"
                content=""
                isOwner={true}
                offset={offset}
                scale={scale}
                onRecolor={(color) => console.log('recolor test note to', color)}
                onDragEnd={(x, y) => console.log('drag ended at', x, y)}
                onTextSave={(text) => console.log('save text', text)}
                />
            </div>
        </div>
    )
}

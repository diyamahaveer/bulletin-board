import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Board from './components/Board'
import { getOrCreateSession } from './lib/auth'

export default function App() {
  const [searchParams] = useSearchParams()

  const highlightId = searchParams.get('highlightId')
  const noteX = parseFloat(searchParams.get('noteX'))
  const noteY = parseFloat(searchParams.get('noteY'))

  useEffect(() => {
    getOrCreateSession()
  }, [])

  return (
    <Board
      initialFocusX={noteX || null}
      initialFocusY={noteY || null}
      highlightId={highlightId || null}
    />
  )
}
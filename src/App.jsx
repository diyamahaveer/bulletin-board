import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Board from './components/Board'
import { getOrCreateSession } from './lib/auth'

export default function App() {
  const [searchParams] = useSearchParams()
  const [userId, setUserId] = useState(null)
  const highlightId = searchParams.get('highlightId')
  const noteX = parseFloat(searchParams.get('noteX'))
  const noteY = parseFloat(searchParams.get('noteY'))

  useEffect(() => {
    getOrCreateSession()
    .then((s) => setUserId(s?.user.id ?? null))
    .catch((err) => console.error('session failed:', err.message))
  }, [])

  if (!userId) return null
  return (
    <Board 
      currentUserId={userId}
      initialFocusX={noteX || null}
      initialFocusY={noteY || null}
      highlightId={highlightId || null}
    />
  )
}
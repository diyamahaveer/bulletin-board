import Board from './components/Board'
import { useEffect } from 'react'
import { getOrCreateSession } from './lib/auth'

export default function App() {
  useEffect(() => {
    getOrCreateSession()
  }, [])

  return (
    <Board/>
  )
}
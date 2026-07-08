import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import ShareRedirect from './components/ShareRedirect.jsx'
import './index.css'
import { BrowserRouter, Route } from 'react-router-dom'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path='/' element={<App />} />
          <Route path='/note/:shareId' element={<ShareRedirect />} />
        </Routes>  
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)

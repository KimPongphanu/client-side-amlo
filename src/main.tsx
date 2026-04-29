import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { NewsProvider } from './context/NewsContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NewsProvider>
      <App />
    </NewsProvider>
  </StrictMode>,
)

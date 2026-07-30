import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/caveat/latin-400.css'
import '@fontsource/caveat/latin-600.css'
import './index.css'
import App from './App'

const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error('Root element not found')
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '../design-system/tokens.css'
import './index.css'
import App from './App.tsx'
import { HouseholdProvider } from './data/household.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <HouseholdProvider>
        <App />
      </HouseholdProvider>
    </BrowserRouter>
  </StrictMode>,
)

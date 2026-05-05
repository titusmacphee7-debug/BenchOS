import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BenchAuth0Provider } from './lib/auth/BenchAuth0Provider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BenchAuth0Provider>
      <App />
    </BenchAuth0Provider>
  </StrictMode>,
)

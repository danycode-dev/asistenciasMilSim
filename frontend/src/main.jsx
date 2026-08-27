import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { UserProvider } from './context/UserContext.jsx'
import { ModalProvider } from './context/ModalContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ModalProvider> 
      <UserProvider> 
        <App />
      </UserProvider>
    </ModalProvider>  
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { UserProvider } from './context/UserContext.jsx'
import { ModalProvider } from './context/ModalContext.jsx'
import { AlertProvider } from './context/AlertContext.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>   
    <AlertProvider>   
      <UserProvider> 
        <App />
      </UserProvider>
    </AlertProvider> 

  </StrictMode>,
)

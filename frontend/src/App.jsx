import { useState } from 'react'

import './App.css'
import DashboardPage from './dashboard/DashboardPage';
import { DataProvider } from './context/DataContext';
import { useUser } from './context/UserContext';
import AuthForm from './auth/AuthForm';
import { ModalProvider } from './context/ModalContext';
import ModalRenderer from './components/modals/ModalRenderer';


// NOTA: MIGRANDO DESDE CODIGO LEGACY A REACT

function App() {
    const { user, isLoading, error } = useUser();

  

    // codigo legacy, no está activo, solo de referencia para migrar a react. Se puede eliminar después de migrar todo a react sin problemas.



  return (
    <>  {isLoading? <div className='loading text-xl'>Cargando...</div>: error?<div className='error'>Error: {error.message}</div>:''}
        <div className="container md:p-2">
            <header>
                <h1>Control de Asistencias</h1>
                <p style={{ color: "#888" }}>Gestión de Personal - V.Comodoro Eban</p>
                <img src="d1.png" alt="Logo Unidad" className="header-logo" />
            </header>
            {
                !user ? <AuthForm />:<DataProvider><ModalProvider> <ModalRenderer></ModalRenderer> <DashboardPage /></ModalProvider> </DataProvider>
            }
            


            



        </div>


    </>
  )
}

export default App

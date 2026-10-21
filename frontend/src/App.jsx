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
    const { user, isLoading, error, AuthLogout } = useUser();

  

    // codigo legacy, no está activo, solo de referencia para migrar a react. Se puede eliminar después de migrar todo a react sin problemas.



  return (
    <>  {isLoading? <div className='loading text-xl'>Cargando...</div>: error?<div className='error'>Error: {error.message}</div>:''}
        <div className="container md:p-2">
            <header className="
              relative flex flex-col items-center
              border-b-2 border-dashboard-accent
              pb-5 mb-7 px-4
            ">
              <h1 className="
                !text-xl sm:!text-3xl
                !font-bold !tracking-wider
                !text-dashboard-accent
              ">
                Gestión MilSim
              </h1>

              <p className="text-gray-400 text-sm mt-1">
                Sistema de Administración de Personal
              </p>

              {/* Logo original */}
            <img
              src="/d1.png"
              alt="Logo MilSim"
              className="
                hidden sm:block
                !absolute !right-0 !top-1/2
                !-translate-y-1/2
                !h-28 md:!h-32
                !w-auto object-contain
              "
            />

              {/* Usuario y cierre de sesión */}
              {user && (
                <div className="
                  flex items-center justify-center
                  gap-3 mt-4
                  text-sm
                ">
                  <div className="
                    flex items-center gap-2
                    bg-dashboard-card
                    border border-dashboard-border
                    rounded-lg px-3 py-2
                  ">
                    <span className="text-gray-400">Usuario:</span>
                    <span className="text-dashboard-accent font-semibold">
                      {user.username}
                    </span>
                  </div>
            
                  <button
                    type="button"
                    onClick={AuthLogout}
                    className="
                      bg-dashboard-button
                      border border-dashboard-border
                      text-dashboard-text
                      hover:bg-dashboard-danger
                      hover:text-white
                      rounded-lg px-3 py-2
                      transition-colors cursor-pointer
                    "
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </header>
            {
                !user ? <AuthForm />:<DataProvider><ModalProvider> <ModalRenderer></ModalRenderer> <DashboardPage /></ModalProvider> </DataProvider>
            }
            


            



        </div>


    </>
  )
}

export default App

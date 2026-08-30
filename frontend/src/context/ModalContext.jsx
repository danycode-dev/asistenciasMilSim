
import { createContext, useContext, useState } from "react";
import TestModal from "../components/modals/ModalTest";
import EditMemberModal from "../components/modals/EditMemberModal";

const ModalContext = createContext(null);


// Registro de modales
const modalComponents = {
    'test': TestModal,
    'edit-member': EditMemberModal,
};


export function ModalProvider({ children }) {

    const [modalStack, setModalStack] = useState([]);


    const openModal = (type, props = {}) => {

        return new Promise((resolve) => {

            setModalStack((currentStack) => [
                ...currentStack,
                {
                    id: crypto.randomUUID(),
                    type,
                    props,
                    resolve
                }
            ]);

        });
    };


    const closeModal = (result) => {

        setModalStack((currentStack) => {

            if (currentStack.length === 0) {
                return currentStack;
            }

            const currentModal = currentStack[currentStack.length - 1];

            currentModal.resolve(result);

            return currentStack.slice(0, -1);

        });

    };


    const closeAllModals = () => {

        setModalStack((currentStack) => {

            currentStack.forEach((modal) => {
                modal.resolve(null);
            });

            return [];

        });

    };


    return (
        <ModalContext.Provider
            value={{
                openModal,
                closeModal,
                closeAllModals
            }}
        >

            {children}


            {/* Renderizamos las modales */}
            {modalStack.map((modal, index) => {

                const ModalComponent = modalComponents[modal.type];

                if (!ModalComponent) {
                    console.warn(
                        `No existe una modal registrada para: ${modal.type}`
                    );

                    return null;
                }

                return (
                    <ModalComponent
                        key={modal.id}
                        {...modal.props}
                    />
                );

            })}

        </ModalContext.Provider>
    );
}


export function useModal() {

    const context = useContext(ModalContext);

    if (!context) {
        throw new Error(
            "useModal debe utilizarse dentro de un ModalProvider"
        );
    }

    return context;
}

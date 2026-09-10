import { useModal } from "../../context/ModalContext";
import EditMemberModal from "./EditMemberModal";
import InsertFromIA from "./InsertFromIAModal";
import TestModal from "./ModalTest";
import NewMemberModal from "./NewMemberModal";
import ViewMemberModal from "./viewMemberModal";

// Registro de modales
const modalComponents = {
    'test': TestModal,
    'edit-member': EditMemberModal,
    'new-member': NewMemberModal,
    'insert-Attendace-IA': InsertFromIA,
    'view-member':ViewMemberModal,
};
export default function ModalRenderer({children}) {

    const { modalStack } = useModal();


    return (

        <>
        
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
        </>
    )

}
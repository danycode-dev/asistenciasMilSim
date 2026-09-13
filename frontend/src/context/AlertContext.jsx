// Función adaptada de un proyecto propio anterior y ajustada a este proyecto.


import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState
} from 'react';

import { CircularProgress } from '@mui/material';

import AlertGlobal from '../components/AlertGlobal';

const AlertContext = createContext();

export const ALERT_TYPES = Object.freeze({
    ERROR: 'error',
    SUCCESS: 'success',
    INFO: 'info',
    WARNING: 'alert'
});

function AlertManager({
    alerts,
    setAlerts
}) {
    const scheduleAlertRemoval = (alertId) => {
        setTimeout(() => {
            setAlerts((previousAlerts) => {
                const updatedAlerts = { ...previousAlerts };

                delete updatedAlerts[alertId];

                return updatedAlerts;
            });
        }, 10000);
    };

    useEffect(() => {
        const alertIds = Object.keys(alerts);

        alertIds.forEach((alertId) => {
            if (alerts[alertId].active === false) {
                alerts[alertId].active = true;
            }

            scheduleAlertRemoval(alertId);
        });
    }, [alerts]);

    return (
        <section>
            {Object.keys(alerts).map((alertId) => (
                <AlertGlobal
                    key={alertId}
                    estado={alerts[alertId].estado}
                    msg={alerts[alertId].msg}
                />
            ))}
        </section>
    );
}

export function AlertProvider({ children }) {
    const [alerts, setAlerts] = useState({});
    const [isGlobalLoading, setIsGlobalLoading] = useState(false);

    const previousLoadingState = useRef(false);

    const showLoadingTimeout = useRef(null);
    const hideLoadingTimeout = useRef(null);

    const addGlobalAlert = ({
        estado = ALERT_TYPES.INFO,
        msg = 'TEST'
    } = {}) => {
        const alertId = Date.now().toString();

        setAlerts((previousAlerts) => ({
            ...previousAlerts,
            [alertId]: {
                estado,
                msg,
                active: false
            }
        }));
    };

    const toggleGlobalLoading = (enabled = null) => {
        if (enabled === null) {
            enabled = !isGlobalLoading;
        }

        // Mostrar loading
        if (
            previousLoadingState.current === false &&
            enabled === true
        ) {
            setIsGlobalLoading(true);

            clearTimeout(hideLoadingTimeout.current);

            previousLoadingState.current = true;

            showLoadingTimeout.current = setTimeout(() => {

            }, 100);

        // Ocultar loading
        } else if (
            previousLoadingState.current === true &&
            enabled === false
        ) {
            previousLoadingState.current = false;

            clearTimeout(showLoadingTimeout.current);

            hideLoadingTimeout.current = setTimeout(() => {
                setIsGlobalLoading(false);
            }, 700);
        }
    };

    return (
        <AlertContext.Provider
            value={{
                addGlobalAlert,
                toggleGlobalLoading
            }}
        >
            {children}

            <AlertManager
                alerts={alerts}
                setAlerts={setAlerts}
            />

            {/* Global loading */}
            <div
                className={`
                    bg-white
                    absolute
                    z-1001
                    top-2.5
                    left-1/2
                    -translate-x-1/2
                    flex
                    justify-center
                    items-center
                    p-1
                    rounded-full
                    transition-transform
                    duration-1000
                    ease-in-out
                    ${
                        isGlobalLoading
                            ? 'translate-y-0'
                            : '-translate-y-[200%]'
                    }
                `}
            >
                <CircularProgress
                    size={26}
                    sx={{
                        '& circle': {
                            strokeWidth: '6px'
                        }
                    }}
                />
            </div>
        </AlertContext.Provider>
    );
}

export function useAlertGlobal() {
    return useContext(AlertContext);
}
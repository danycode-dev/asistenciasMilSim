// Función adaptada de un proyecto propio anterior y ajustada a este proyecto.

import {
    IconExclamationCircle,
    IconAlertTriangle,
    IconCheck
} from '@tabler/icons-react';

function AlertGlobal({
    estado = 'error',
    msg = 'Error: Error de Conexion'
}) {

    const estilosEstado = {
        error: `
            bg-[#363636]
            text-[#e0e0e0]
            border
            border-[#e74c3c]
            border-l-[4px]
            border-l-[#e74c3c]
        `,

        success: `
            bg-[#363636]
            text-[#e0e0e0]
            border
            border-[#2ecc71]
            border-l-[4px]
            border-l-[#2ecc71]
        `,

        info: `
            bg-[#2d2d2d]
            text-[#e0e0e0]
            border
            border-[#444]
            border-l-[4px]
            border-l-[#d4af37]
        `,

        alert: `
            bg-[#2d2d2d]
            text-[#e0e0e0]
            border
            border-[#d4af37]
            border-l-[4px]
            border-l-[#d4af37]
        `,
    };

    const iconos = {
        error: IconAlertTriangle,
        success: IconCheck,
        info: IconExclamationCircle,
        alert: IconAlertTriangle,
    };

    const Icon = iconos[estado] || IconExclamationCircle;

    return (
        <div
            className={`
                absolute
                z-1001
                top-0
                left-1/2
                min-w-70
                min-h-15
                rounded-lg
                flex
                items-center
                px-2.5
                gap-2.5
                shadow-lg
                shadow-black/30
                animate-show-and-hide
                ${estilosEstado[estado] || estilosEstado.info}
            `}
        >
            <Icon
                className="size-7.5"
                stroke={2}
            />

            <span>
                {msg}
            </span>
        </div>
    );
}

export default AlertGlobal;
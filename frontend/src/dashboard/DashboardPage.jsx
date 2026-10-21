import { useState, useEffect } from 'react'
import AttendanceTab from './tabs/AttendanceTab';
import { useDashboardData } from '../context/DataContext';
import StatsTab from './tabs/StatsTab';
import MemberTab from './tabs/MembersTab';


export default function DashboardPage() {


    const [activeTab, setActiveTab] = useState('registro');
    const { dashboardData, setDashboardData } = useDashboardData();



    return (
    <>
        <div className="tabs overflow-x-auto">
            <button className={`tab-btn ${activeTab === 'registro' ? 'active' : ''}`} onClick={() => setActiveTab('registro')}>Registro Diario</button>
            <button className={`tab-btn ${activeTab === 'estadisticas' ? 'active' : ''}`} onClick={() => setActiveTab('estadisticas')}>Estadísticas</button>
            {/* <button className={`tab-btn ${activeTab === 'meses' ? 'active' : ''}`} onClick={() => setActiveTab('meses')}>Meses</button> */}
            <button className={`tab-btn ${activeTab === 'miembros' ? 'active' : ''}`} onClick={() => setActiveTab('miembros')}>Gestionar Miembros</button>
            <button className={`tab-btn`} onClick={() => setActiveTab('estadisticas')}>Gestionar Rangos</button>
            <button className={`tab-btn`} onClick={() => setActiveTab('estadisticas')}>Gestionar Unidades</button>
            <button className={`tab-btn`} onClick={() => setActiveTab('estadisticas')}>Gestionar Usuarios y roles</button>
        
        </div>


        {activeTab === 'registro' && <AttendanceTab />}
        {activeTab === 'estadisticas' && <StatsTab />}
        {activeTab === 'meses' && <div id="meses" className="tab-content active"><h2>Meses</h2></div>}
        {activeTab === 'miembros' && <MemberTab />}
    </>
    );
} 